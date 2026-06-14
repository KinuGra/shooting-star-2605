package com.shootingstar.service;

import com.shootingstar.dto.judge.JudgeResultResponse;
import com.shootingstar.entity.*;
import com.shootingstar.repository.*;
import com.shootingstar.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@Transactional
public class JudgeService {

    private static final Logger log = LoggerFactory.getLogger(JudgeService.class);

    // ホスト (Docker VM) 上の共有ディレクトリ。backend コンテナと Docker デーモン両方から見える。
    private static final String JUDGE_TMP_DIR = "/tmp/judge";
    private static final int WALL_TIME_LIMIT_SEC = 15;
    private static final int COMPILE_TIME_LIMIT_SEC = 30;

    private static final Map<String, String> LANGUAGE_IMAGES = Map.of(
        "python3",    "python:3-slim",
        "python",     "python:3-slim",
        "javascript", "node:20-slim",
        "js",         "node:20-slim",
        "c",          "gcc:13",
        "c++",        "gcc:13",
        "cpp",        "gcc:13",
        "java",       "eclipse-temurin:21"
    );

    private final TestCaseRepository testCaseRepository;
    private final JudgeResultRepository judgeResultRepository;
    private final SubmissionRepository submissionRepository;

    public JudgeService(TestCaseRepository testCaseRepository,
                        JudgeResultRepository judgeResultRepository,
                        SubmissionRepository submissionRepository) {
        this.testCaseRepository = testCaseRepository;
        this.judgeResultRepository = judgeResultRepository;
        this.submissionRepository = submissionRepository;
    }

    public void judgeSubmission(Submission submission) {
        List<TestCase> testCases = testCaseRepository
                .findByAssignmentOrderByOrderIndexAsc(submission.getAssignment());

        String code = submission.getCodeContent();
        String language = submission.getLanguage();

        if (code == null || code.isBlank() || language == null || testCases.isEmpty()) {
            return;
        }

        String runId = submission.getId().toString();
        Path workDir = Path.of(JUDGE_TMP_DIR, runId);

        try {
            Files.createDirectories(workDir);
            writeSrcFile(language, code, workDir);

            // コンパイル (C / C++ / Java のみ)
            String compileError = compile(language, workDir);
            if (compileError != null) {
                log.warn("[Judge] CE submissionId={} error={}", submission.getId(),
                        compileError.length() > 200 ? compileError.substring(0, 200) : compileError);
                for (TestCase tc : testCases) {
                    judgeResultRepository.save(buildResult(submission, tc, JudgeStatus.CE, 0));
                }
                submission.setScore(0);
                submissionRepository.save(submission);
                return;
            }

            int totalScore = 0;
            for (TestCase tc : testCases) {
                JudgeResult r = runTestCase(submission, tc, language, workDir);
                judgeResultRepository.save(r);
                log.info("[Judge] submissionId={} testCaseId={} status={} execMs={}",
                        submission.getId(), tc.getId(), r.getStatus(), r.getExecutionTimeMs());
                if (r.getStatus() == JudgeStatus.AC) {
                    totalScore += tc.getScore() != null ? tc.getScore() : 0;
                }
            }

            submission.setScore(totalScore);
            submissionRepository.save(submission);

        } catch (Exception e) {
            log.error("[Judge] Failed for submissionId={}", submission.getId(), e);
        } finally {
            deleteDir(workDir);
        }
    }

    // ─── コンパイル ────────────────────────────────────────────────────────────

    /** null を返せばコンパイル成功。エラーメッセージを返せば CE。 */
    private String compile(String language, Path workDir)
            throws IOException, InterruptedException {

        String lang = language.toLowerCase();
        List<String> compileArgs = switch (lang) {
            case "c"         -> List.of("/bin/sh", "-c", "gcc /work/solution.c -o /work/solution.out 2>&1");
            case "c++", "cpp" -> List.of("/bin/sh", "-c", "g++ /work/solution.cpp -o /work/solution.out 2>&1");
            case "java"      -> List.of("/bin/sh", "-c", "cd /work && javac Main.java 2>&1");
            default          -> null; // Python / JS はコンパイル不要
        };
        if (compileArgs == null) return null;

        List<String> cmd = dockerCmd(LANGUAGE_IMAGES.get(lang), workDir, false, compileArgs);
        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.redirectErrorStream(true);
        Process p = pb.start();
        String output = new String(p.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        boolean finished = p.waitFor(COMPILE_TIME_LIMIT_SEC, TimeUnit.SECONDS);
        if (!finished) { p.destroyForcibly(); return "Compilation timed out"; }
        return p.exitValue() == 0 ? null : output;
    }

    // ─── テストケース実行 ──────────────────────────────────────────────────────

    private JudgeResult runTestCase(Submission submission, TestCase tc,
                                    String language, Path workDir)
            throws IOException, InterruptedException {

        String lang = language.toLowerCase();
        String image = LANGUAGE_IMAGES.get(lang);
        if (image == null) {
            return buildResult(submission, tc, JudgeStatus.IE, 0);
        }

        List<String> runArgs = switch (lang) {
            case "python3", "python" -> List.of("python3", "/work/solution.py");
            case "javascript", "js"  -> List.of("node", "/work/solution.js");
            case "c", "c++", "cpp"   -> List.of("/work/solution.out");
            case "java"              -> List.of("/bin/sh", "-c", "cd /work && java Main");
            default                  -> null;
        };
        if (runArgs == null) {
            return buildResult(submission, tc, JudgeStatus.IE, 0);
        }

        List<String> cmd = dockerCmd(image, workDir, true, runArgs);
        ProcessBuilder pb = new ProcessBuilder(cmd);
        long startMs = System.currentTimeMillis();
        Process process = pb.start();

        // stdin にテストケース入力を流す
        try (OutputStream stdin = process.getOutputStream()) {
            if (tc.getInput() != null && !tc.getInput().isEmpty()) {
                stdin.write(tc.getInput().getBytes(StandardCharsets.UTF_8));
            }
        }

        // stdout を非同期で読む（パイプバッファ詰まり防止）
        CompletableFuture<String> stdoutFuture = CompletableFuture.supplyAsync(() -> {
            try {
                return new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            } catch (IOException e) { return ""; }
        });
        // stderr は捨てる
        CompletableFuture.runAsync(() -> {
            try { process.getErrorStream().transferTo(OutputStream.nullOutputStream()); }
            catch (IOException ignored) {}
        });

        boolean finished = process.waitFor(WALL_TIME_LIMIT_SEC, TimeUnit.SECONDS);
        long execMs = System.currentTimeMillis() - startMs;

        if (!finished) {
            process.destroyForcibly();
            return buildResult(submission, tc, JudgeStatus.TLE, (int) execMs);
        }

        String stdout = stdoutFuture.join();
        int exitCode = process.exitValue();

        if (exitCode == 137) { // OOM kill
            return buildResult(submission, tc, JudgeStatus.MLE, (int) execMs);
        }
        if (exitCode != 0) {
            return buildResult(submission, tc, JudgeStatus.RE, (int) execMs);
        }

        String expected = tc.getExpectedOutput() != null ? tc.getExpectedOutput() : "";
        JudgeStatus status = stdout.stripTrailing().equals(expected.stripTrailing())
                ? JudgeStatus.AC : JudgeStatus.WA;
        return buildResult(submission, tc, status, (int) execMs);
    }

    // ─── Docker コマンド組み立て ───────────────────────────────────────────────

    private List<String> dockerCmd(String image, Path workDir,
                                   boolean interactive, List<String> runArgs) {
        List<String> cmd = new ArrayList<>(List.of(
            "docker", "run", "--rm",
            "--network=none",
            "--memory=256m",
            "--cpus=0.5",
            "-v", workDir.toAbsolutePath() + ":/work"
        ));
        if (interactive) cmd.add("-i"); // stdin を有効化
        cmd.add(image);
        cmd.addAll(runArgs);
        return cmd;
    }

    // ─── ユーティリティ ────────────────────────────────────────────────────────

    private void writeSrcFile(String language, String code, Path workDir) throws IOException {
        String filename = switch (language.toLowerCase()) {
            case "java"          -> "Main.java";
            case "c"             -> "solution.c";
            case "c++", "cpp"   -> "solution.cpp";
            case "javascript", "js" -> "solution.js";
            default              -> "solution.py";
        };
        Files.writeString(workDir.resolve(filename), code, StandardCharsets.UTF_8);
    }

    private JudgeResult buildResult(Submission submission, TestCase tc,
                                    JudgeStatus status, int execMs) {
        JudgeResult r = new JudgeResult();
        r.setSubmission(submission);
        r.setTestCase(tc);
        r.setStatus(status);
        r.setExecutionTimeMs(execMs);
        r.setMemoryKb(0);
        r.setCreatedAt(OffsetDateTime.now());
        return r;
    }

    private void deleteDir(Path dir) {
        try {
            Files.walk(dir)
                    .sorted(Comparator.reverseOrder())
                    .forEach(p -> { try { Files.delete(p); } catch (IOException ignored) {} });
        } catch (IOException e) {
            log.warn("[Judge] Failed to delete workdir {}", dir);
        }
    }

    // ─── 採点結果取得 (教員・学生向け) ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<JudgeResultResponse> getJudgeResults(UserPrincipal principal, UUID submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found"));

        return judgeResultRepository.findBySubmission(submission).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private JudgeResultResponse toResponse(JudgeResult result) {
        return new JudgeResultResponse(
                result.getId(),
                result.getSubmission().getId(),
                result.getTestCase().getId(),
                result.getStatus().name(),
                result.getExecutionTimeMs(),
                result.getMemoryKb(),
                result.getCreatedAt()
        );
    }
}

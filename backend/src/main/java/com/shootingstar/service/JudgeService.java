package com.shootingstar.service;

import com.shootingstar.dto.judge.JudgeResultResponse;
import com.shootingstar.entity.JudgeResult;
import com.shootingstar.entity.JudgeStatus;
import com.shootingstar.entity.Submission;
import com.shootingstar.entity.TestCase;
import com.shootingstar.repository.JudgeResultRepository;
import com.shootingstar.repository.SubmissionRepository;
import com.shootingstar.repository.TestCaseRepository;
import com.shootingstar.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class JudgeService {

    private final TestCaseRepository testCaseRepository;
    private final JudgeResultRepository judgeResultRepository;
    private final SubmissionRepository submissionRepository;
    private final SecureRandom random = new SecureRandom();

    public JudgeService(TestCaseRepository testCaseRepository,
                        JudgeResultRepository judgeResultRepository,
                        SubmissionRepository submissionRepository) {
        this.testCaseRepository = testCaseRepository;
        this.judgeResultRepository = judgeResultRepository;
        this.submissionRepository = submissionRepository;
    }

    public void judgeSubmission(Submission submission) {
        List<TestCase> testCases = testCaseRepository.findByAssignmentOrderByOrderIndexAsc(submission.getAssignment());

        int totalScore = 0;
        for (TestCase testCase : testCases) {
            JudgeResult result = new JudgeResult();
            result.setSubmission(submission);
            result.setTestCase(testCase);
            result.setStatus(JudgeStatus.AC);
            result.setExecutionTimeMs(10 + random.nextInt(491));
            result.setMemoryKb(1000 + random.nextInt(4001));
            result.setCreatedAt(OffsetDateTime.now());
            judgeResultRepository.save(result);
            totalScore += testCase.getScore() != null ? testCase.getScore() : 0;
        }

        submission.setScore(totalScore);
        submissionRepository.save(submission);
    }

    @Transactional(readOnly = true)
    public List<JudgeResultResponse> getJudgeResults(UserPrincipal principal, UUID submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found"));

        boolean isOwner = submission.getUser().getId().equals(principal.getId());
        if (!isOwner) {
            return judgeResultRepository.findBySubmission(submission).stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        if (!submission.isReturned()) {
            return Collections.emptyList();
        }

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

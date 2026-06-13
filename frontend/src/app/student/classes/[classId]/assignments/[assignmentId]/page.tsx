"use client";

import Link from "next/link";
import { useState, use } from "react";
import { JudgeBadge } from "@/components/Badge";
import { MOCK_ASSIGNMENTS, MOCK_CLASSES, MOCK_SUBMISSIONS } from "@/lib/mock-data";
import type { JudgeStatus, Submission, TestResult } from "@/lib/types";

const LANGUAGES = ["Python", "Java", "C++", "C", "JavaScript", "Go", "Rust"];

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

interface JudgeResult { status: JudgeStatus; score: number; maxScore: number; testResults: TestResult[] }

interface Props { params: Promise<{ classId: string; assignmentId: string }> }

export default function AssignmentPage({ params }: Props) {
  const { classId, assignmentId } = use(params);
  const assignment = MOCK_ASSIGNMENTS.find((a) => a.id === assignmentId);
  const cls = MOCK_CLASSES.find((c) => c.id === classId);
  const initialSubs = MOCK_SUBMISSIONS
    .filter((s) => s.assignmentId === assignmentId && s.studentId === "stu-1")
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const [code, setCode] = useState(initialSubs[0]?.code ?? "# ここにコードを入力してください\n\n");
  const [language, setLanguage] = useState(assignment?.language ?? "Python");
  const [submitting, setSubmitting] = useState(false);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubs);

  if (!assignment || !cls) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <p style={{ color: "var(--color-text-muted)" }}>課題が見つかりません</p>
    </div>
  );

  const isPast = new Date(assignment.deadline) < new Date();

  async function handleSubmit() {
    if (!code.trim() || submitting) return;
    setSubmitting(true);
    setJudgeResult(null);
    await new Promise((r) => setTimeout(r, 1400));
    const result: JudgeResult = {
      status: "AC",
      score: assignment!.maxScore,
      maxScore: assignment!.maxScore,
      testResults: [
        { testCaseId: "tc-1", label: "ケース 1", status: "AC", executionTimeMs: 12, memoryKb: 2048 },
        { testCaseId: "tc-2", label: "ケース 2", status: "AC", executionTimeMs: 15, memoryKb: 2048 },
        { testCaseId: "tc-3", label: "ケース 3", status: "AC", executionTimeMs: 9,  memoryKb: 2048 },
      ],
    };
    setJudgeResult(result);
    setSubmissions((prev) => [
      { id: `sub-${Date.now()}`, assignmentId: assignment!.id, studentId: "stu-1", studentName: "山田 太郎",
        code, language, submittedAt: new Date().toISOString(), ...result },
      ...prev,
    ]);
    setSubmitting(false);
  }

  function handleTab(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const s = e.currentTarget.selectionStart;
    const next = `${code.slice(0, s)}    ${code.slice(e.currentTarget.selectionEnd)}`;
    setCode(next);
    requestAnimationFrame(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = s + 4; });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100vh - 64px)" }}>
      {/* Toolbar */}
      <div
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          padding: "0 24px",
          height: 48,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
          <Link href="/student" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>マイ授業</Link>
          <span>›</span>
          <Link href={`/student/classes/${classId}`} style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>{cls.name}</Link>
          <span>›</span>
          <span style={{ color: "var(--color-text-primary)" }}>{assignment.title}</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "0.75rem", color: isPast ? "var(--color-danger)" : "var(--color-text-muted)" }}>
            期限: {new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(assignment.deadline))}
            {isPast ? " (締切)" : ""}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{assignment.maxScore}点満点</span>
        </div>
      </div>

      {/* Split layout */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: problem */}
        <div
          style={{
            width: 380,
            flexShrink: 0,
            borderRight: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            overflowY: "auto",
            padding: "24px",
          }}
        >
          <h1 style={{ fontSize: "1.0625rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 16, letterSpacing: "-0.01em" }}>
            {assignment.title}
          </h1>
          <div style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            {assignment.description.replace(/```[\s\S]*?```/g, (m) => m)}
          </div>
        </div>

        {/* Right: editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Editor toolbar */}
          <div
            style={{
              height: 40,
              borderBottom: "1px solid var(--color-border)",
              background: "var(--color-bg)",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              gap: 12,
            }}
          >
            <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 500 }}>言語</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: "0.8125rem",
                color: "var(--color-text-primary)",
                background: "var(--color-surface)",
                outline: "none",
              }}
            >
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
            <div style={{ marginLeft: "auto" }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || isPast}
                style={{
                  padding: "5px 16px",
                  background: submitting || isPast ? "#ccc" : "var(--color-primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  cursor: submitting || isPast ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {submitting ? "採点中..." : "提出する"}
              </button>
            </div>
          </div>

          {/* Editor */}
          <div style={{ flex: 1, background: "#1e1e1e", overflow: "hidden" }}>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleTab}
              spellCheck={false}
              autoComplete="off"
              className="code-editor"
              style={{
                width: "100%",
                height: "100%",
                background: "transparent",
                color: "#d4d4d4",
                border: "none",
                outline: "none",
                resize: "none",
                padding: "20px",
                caretColor: "#aeafad",
              }}
            />
          </div>

          {/* Judge result */}
          {judgeResult && (
            <div
              style={{
                borderTop: `1px solid ${judgeResult.status === "AC" ? "#a8d5b5" : "var(--color-border)"}`,
                background: judgeResult.status === "AC" ? "var(--color-success-surface)" : "var(--color-bg)",
                padding: "16px 20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <JudgeBadge status={judgeResult.status} size="lg" />
                <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  {judgeResult.score}/{judgeResult.maxScore} 点
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {judgeResult.testResults.map((tr) => (
                  <div
                    key={tr.testCaseId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 6,
                      padding: "5px 10px",
                      fontSize: "0.75rem",
                    }}
                  >
                    <span style={{ color: "var(--color-text-muted)" }}>{tr.label}</span>
                    <JudgeBadge status={tr.status} size="sm" />
                    <span style={{ color: "var(--color-text-muted)" }}>{tr.executionTimeMs}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submission history */}
      {submissions.length > 0 && (
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            padding: "12px 24px",
          }}
        >
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            提出履歴
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {submissions.map((sub, idx) => (
              <Link
                key={sub.id}
                href={`/student/classes/${classId}/assignments/${assignmentId}/submissions/${sub.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 12px",
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 6,
                  textDecoration: "none",
                  fontSize: "0.8125rem",
                }}
              >
                <span style={{ color: "var(--color-text-muted)" }}>#{submissions.length - idx}</span>
                <JudgeBadge status={sub.status} size="sm" />
                <span style={{ color: "var(--color-text-secondary)" }}>{sub.score}/{sub.maxScore}点</span>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.6875rem" }}>{fmtDate(sub.submittedAt)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

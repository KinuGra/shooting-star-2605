"use client";

import Link from "next/link";
import { useState, use } from "react";
import { JudgeBadge } from "@/components/Badge";
import { useGetAssignment } from "@/api/generated/assignments/assignments";
import { useGetCourse } from "@/api/generated/courses/courses";
import {
  useGetFeedback,
  useAddFeedback,
} from "@/api/generated/feedback/feedback";
import {
  useGetSubmission,
  useUpdateScore,
} from "@/api/generated/submissions/submissions";
import type { JudgeResultResponse } from "@/api/model";
import type { JudgeStatus } from "@/lib/types";

const STATUS_PRIORITY: JudgeStatus[] = ["WA", "RE", "CE", "TLE", "MLE", "AC"];

function overallStatus(
  results: JudgeResultResponse[] | undefined,
): JudgeStatus {
  if (!results || results.length === 0) return "pending";
  for (const s of STATUS_PRIORITY) {
    if (results.some((r) => r.status === s)) return s;
  }
  return "AC";
}

interface Props {
  params: Promise<{
    classId: string;
    assignmentId: string;
    submissionId: string;
  }>;
}

export default function TeacherSubmissionDetailPage({ params }: Props) {
  const { classId, assignmentId, submissionId } = use(params);

  const { data: subData, isLoading: sLoading } = useGetSubmission(submissionId);
  const { data: assignmentData, isLoading: aLoading } =
    useGetAssignment(assignmentId);
  const { data: courseData, isLoading: cLoading } = useGetCourse(classId);
  const { data: feedbackData, mutate: mutateFeedback } =
    useGetFeedback(submissionId);

  const { trigger: triggerScore } = useUpdateScore(submissionId);
  const { trigger: triggerFeedback } = useAddFeedback(submissionId);

  const sub = subData?.data;
  const assignment = assignmentData?.data;
  const course = courseData?.data;

  const [comment, setComment] = useState("");
  const [overrideScore, setOverrideScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentScore = overrideScore ?? sub?.score ?? 0;

  if (sLoading || aLoading || cLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <p style={{ color: "var(--color-text-muted)" }}>読み込み中...</p>
      </div>
    );
  }

  if (!sub || !assignment || !course) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <p style={{ color: "var(--color-danger)" }}>
          データの読み込みに失敗しました
        </p>
      </div>
    );
  }

  const submittedAt = sub.submittedAt
    ? new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(sub.submittedAt))
    : "—";

  const judgeResults = sub.judgeResults ?? [];
  const feedbacks =
    (feedbackData?.data as
      | { id: string; body: string; authorName?: string; createdAt?: string }[]
      | undefined) ?? [];

  async function handleSave() {
    setSaving(true);
    try {
      if (overrideScore !== null) {
        await triggerScore({ score: overrideScore });
      }
      if (comment.trim()) {
        await triggerFeedback({ body: comment.trim() });
        await mutateFeedback();
        setComment("");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          marginBottom: 28,
          fontSize: "0.8125rem",
          color: "var(--color-text-muted)",
        }}
      >
        <Link
          href="/teacher"
          style={{
            color: "var(--color-text-secondary)",
            textDecoration: "none",
          }}
        >
          ダッシュボード
        </Link>
        <span>›</span>
        <Link
          href={`/teacher/classes/${classId}`}
          style={{
            color: "var(--color-text-secondary)",
            textDecoration: "none",
          }}
        >
          {course.name}
        </Link>
        <span>›</span>
        <Link
          href={`/teacher/classes/${classId}/assignments/${assignmentId}/submissions`}
          style={{
            color: "var(--color-text-secondary)",
            textDecoration: "none",
          }}
        >
          {assignment.title}
        </Link>
        <span>›</span>
        <span style={{ color: "var(--color-text-primary)" }}>
          {sub.userName ?? "—"}
        </span>
      </div>

      {/* Student + result header */}
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: "20px 24px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: "var(--color-primary-subtle)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--color-primary)",
            }}
          >
            {(sub.userName ?? "?").charAt(0)}
          </div>
          <div>
            <p
              style={{
                fontSize: "1.0625rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: 2,
              }}
            >
              {sub.userName ?? "—"}
            </p>
            <p
              style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}
            >
              {submittedAt}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <JudgeBadge status={overallStatus(judgeResults)} size="lg" />
          <span
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.03em",
            }}
          >
            {sub.score ?? "—"}
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 400,
                color: "var(--color-text-muted)",
              }}
            >
              /{assignment.maxScore ?? "—"}
            </span>
          </span>
        </div>
      </div>

      {/* Test results */}
      {judgeResults.length > 0 && (
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              padding: "12px 20px",
              borderBottom: "1px solid var(--color-border)",
              background: "var(--color-bg)",
            }}
          >
            <p
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              自動採点結果
            </p>
          </div>
          {judgeResults.map((tr, idx) => (
            <div
              key={tr.id ?? idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "12px 20px",
                borderBottom:
                  idx < judgeResults.length - 1
                    ? "1px solid var(--color-divider)"
                    : "none",
              }}
            >
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                  width: 100,
                }}
              >
                テストケース {idx + 1}
              </span>
              <JudgeBadge status={(tr.status as JudgeStatus) ?? "pending"} />
              <div
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  gap: 20,
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                }}
              >
                {tr.executionTimeMs != null && (
                  <span>実行時間: {tr.executionTimeMs}ms</span>
                )}
                {tr.memoryKb != null && (
                  <span>メモリ: {(tr.memoryKb / 1024).toFixed(1)}MB</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Existing feedbacks */}
      {feedbacks.length > 0 && (
        <div
          style={{
            background: "var(--color-primary-subtle)",
            border: "1px solid var(--color-primary-surface)",
            borderRadius: 12,
            padding: "20px 24px",
            marginBottom: 16,
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--color-primary)",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            フィードバック履歴
          </p>
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              style={{
                marginBottom: 12,
                paddingBottom: 12,
                borderBottom: "1px solid var(--color-primary-surface)",
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-primary)",
                  marginBottom: 4,
                }}
              >
                {fb.authorName ?? "教員"}{" "}
                {fb.createdAt
                  ? new Intl.DateTimeFormat("ja-JP", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(fb.createdAt))
                  : ""}
              </p>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--color-text-primary)",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                }}
              >
                {fb.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Grading panel */}
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: "24px",
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            marginBottom: 20,
          }}
        >
          採点・コメント
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            gap: 16,
            alignItems: "start",
            marginBottom: 16,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--color-text-primary)",
                marginBottom: 6,
              }}
            >
              スコア修正
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number"
                min={0}
                max={assignment.maxScore ?? undefined}
                value={currentScore}
                onChange={(e) => setOverrideScore(Number(e.target.value))}
                style={{
                  width: 72,
                  border: "1.5px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }}
              />
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                / {assignment.maxScore ?? "—"}点
              </span>
            </div>
            <p
              style={{
                marginTop: 6,
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
              }}
            >
              自動採点: {sub.score ?? "—"}/{assignment.maxScore ?? "—"}
            </p>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--color-text-primary)",
                marginBottom: 6,
              }}
            >
              コメントを追加
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="学生へのフィードバックを入力してください..."
              style={{
                width: "100%",
                border: "1.5px solid var(--color-border)",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: "0.875rem",
                color: "var(--color-text-primary)",
                background: "var(--color-bg)",
                outline: "none",
                resize: "vertical",
                lineHeight: 1.6,
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
                e.currentTarget.style.background = "#fff";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 20px",
              background: saving ? "#b0c8ef" : "var(--color-primary)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "保存中..." : "採点を保存"}
          </button>
          {saved && (
            <span
              style={{
                fontSize: "0.875rem",
                color: "var(--color-success)",
                fontWeight: 500,
              }}
            >
              ✓ 保存しました
            </span>
          )}
        </div>
      </div>

      {/* Code view */}
      {sub.codeContent && (
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              borderBottom: "1px solid var(--color-border)",
              background: "var(--color-bg)",
            }}
          >
            <p
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              提出コード
            </p>
            <span
              style={{
                fontFamily: "var(--font-geist-mono, monospace)",
                fontSize: "0.6875rem",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 4,
                padding: "2px 8px",
                color: "var(--color-text-secondary)",
              }}
            >
              {sub.language ?? "—"}
            </span>
          </div>
          <div style={{ background: "#1e1e1e", overflowX: "auto" }}>
            <pre
              className="code-editor"
              style={{ margin: 0, padding: "20px 24px", color: "#d4d4d4" }}
            >
              {sub.codeContent.split("\n").map((line, i) => (
                <div key={i} style={{ display: "flex", gap: 20 }}>
                  <span
                    style={{
                      minWidth: 28,
                      textAlign: "right",
                      color: "#555",
                      userSelect: "none",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span>{line}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>
      )}

      <Link
        href={`/teacher/classes/${classId}/assignments/${assignmentId}/submissions`}
        style={{
          fontSize: "0.875rem",
          color: "var(--color-primary)",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        ← 提出物一覧に戻る
      </Link>
    </div>
  );
}

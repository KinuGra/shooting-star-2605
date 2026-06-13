"use client";

import Link from "next/link";
import { use } from "react";
import { JudgeBadge } from "@/components/Badge";
import { useGetAssignment } from "@/api/generated/assignments/assignments";
import { useGetCourse } from "@/api/generated/courses/courses";
import { useGetFeedback } from "@/api/generated/feedback/feedback";
import { useGetSubmission } from "@/api/generated/submissions/submissions";
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

export default function SubmissionDetailPage({ params }: Props) {
  const { classId, assignmentId, submissionId } = use(params);

  const { data: subData, isLoading: sLoading } = useGetSubmission(submissionId);
  const { data: assignmentData, isLoading: aLoading } =
    useGetAssignment(assignmentId);
  const { data: courseData, isLoading: cLoading } = useGetCourse(classId);
  const { data: feedbackData } = useGetFeedback(submissionId);

  const sub = subData?.data;
  const assignment = assignmentData?.data;
  const course = courseData?.data;

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
  const passedCount = judgeResults.filter((r) => r.status === "AC").length;
  const maxMs =
    judgeResults.length > 0
      ? Math.max(...judgeResults.map((r) => r.executionTimeMs ?? 0))
      : 0;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
      {/* Breadcrumb */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 28,
          fontSize: "0.8125rem",
          color: "var(--color-text-muted)",
        }}
      >
        <Link
          href="/student"
          style={{
            textDecoration: "none",
            color: "var(--color-text-secondary)",
          }}
        >
          マイ授業
        </Link>
        <span>›</span>
        <Link
          href={`/student/classes/${classId}`}
          style={{
            textDecoration: "none",
            color: "var(--color-text-secondary)",
          }}
        >
          {course.name}
        </Link>
        <span>›</span>
        <Link
          href={`/student/classes/${classId}/assignments/${assignmentId}`}
          style={{
            textDecoration: "none",
            color: "var(--color-text-secondary)",
          }}
        >
          {assignment.title}
        </Link>
        <span>›</span>
        <span style={{ color: "var(--color-text-primary)" }}>提出詳細</span>
      </div>

      {/* Result header */}
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: "24px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <JudgeBadge status={overallStatus(judgeResults)} size="lg" />
            <div>
              <p
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {sub.score ?? "—"}
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: 400,
                    color: "var(--color-text-muted)",
                  }}
                >
                  /{assignment.maxScore ?? "—"}
                </span>
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  marginTop: 2,
                }}
              >
                {submittedAt}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            background: "var(--color-border)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {[
            { label: "言語", value: sub.language ?? "—" },
            {
              label: "テスト通過",
              value: `${passedCount} / ${judgeResults.length}`,
            },
            { label: "最大実行時間", value: `${maxMs} ms` },
          ].map((m) => (
            <div
              key={m.label}
              style={{ background: "var(--color-bg)", padding: "12px 16px" }}
            >
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--color-text-muted)",
                  fontWeight: 500,
                  marginBottom: 4,
                }}
              >
                {m.label}
              </p>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {m.value}
              </p>
            </div>
          ))}
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
              padding: "14px 20px",
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
              テスト結果
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
                  color: "var(--color-text-primary)",
                  fontWeight: 500,
                  width: 100,
                }}
              >
                テストケース {idx + 1}
              </span>
              <JudgeBadge status={(tr.status as JudgeStatus) ?? "pending"} />
              <div style={{ marginLeft: "auto", display: "flex", gap: 20 }}>
                {tr.executionTimeMs != null && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    実行時間: {tr.executionTimeMs}ms
                  </span>
                )}
                {tr.memoryKb != null && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    メモリ: {(tr.memoryKb / 1024).toFixed(1)}MB
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Teacher feedbacks */}
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
            教員フィードバック
          </p>
          {feedbacks.map((fb, idx) => (
            <div
              key={fb.id}
              style={{
                marginBottom: idx < feedbacks.length - 1 ? 12 : 0,
                paddingBottom: idx < feedbacks.length - 1 ? 12 : 0,
                borderBottom:
                  idx < feedbacks.length - 1
                    ? "1px solid var(--color-primary-surface)"
                    : "none",
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

      {/* Code */}
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
              padding: "14px 20px",
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
                fontSize: "0.6875rem",
                fontFamily: "var(--font-geist-mono, monospace)",
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
              style={{ padding: "20px 24px", color: "#d4d4d4", margin: 0 }}
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
        href={`/student/classes/${classId}/assignments/${assignmentId}`}
        style={{
          fontSize: "0.875rem",
          color: "var(--color-primary)",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        ← 課題に戻る
      </Link>
    </div>
  );
}

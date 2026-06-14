"use client";

import Link from "next/link";
import { use } from "react";
import { JudgeBadge } from "@/components/Badge";
import { useGetAssignment } from "@/api/generated/assignments/assignments";
import { useGetCourse } from "@/api/generated/courses/courses";
import {
  useGetSubmissions,
  useReturnSubmissions,
} from "@/api/generated/submissions/submissions";
import type { JudgeResultResponse, SubmissionResponse } from "@/api/model";
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
  params: Promise<{ classId: string; assignmentId: string }>;
}

export default function SubmissionsListPage({ params }: Props) {
  const { classId, assignmentId } = use(params);

  const {
    data: assignmentData,
    isLoading: aLoading,
    error: aError,
  } = useGetAssignment(assignmentId);
  const {
    data: courseData,
    isLoading: cLoading,
    error: cError,
  } = useGetCourse(classId);
  const {
    data: subsData,
    isLoading: sLoading,
    error: sError,
    mutate: mutateSubmissions,
  } = useGetSubmissions(assignmentId);
  const { trigger: triggerReturn, isMutating: isReturning } =
    useReturnSubmissions(assignmentId);

  if (aLoading || cLoading || sLoading) {
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

  if (
    aError ||
    cError ||
    sError ||
    !assignmentData?.data ||
    !courseData?.data
  ) {
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

  const assignment = assignmentData.data;
  const course = courseData.data;
  const submissions: SubmissionResponse[] = (
    (subsData?.data as SubmissionResponse[] | undefined) ?? []
  ).sort(
    (a, b) =>
      new Date(b.submittedAt ?? "").getTime() -
      new Date(a.submittedAt ?? "").getTime(),
  );

  const acCount = submissions.filter(
    (s) => overallStatus(s.judgeResults) === "AC",
  ).length;
  const latestPerUser = new Map<string, SubmissionResponse>();
  for (const s of submissions) {
    const uid = s.userId ?? "";
    const existing = latestPerUser.get(uid);
    if (!existing || new Date(s.submittedAt ?? "") > new Date(existing.submittedAt ?? "")) {
      latestPerUser.set(uid, s);
    }
  }
  const unreturnedCount = [...latestPerUser.values()].filter((s) => !s.returned).length;

  async function handleReturn() {
    await triggerReturn();
    mutateSubmissions();
  }

  const avgScore =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((acc, s) => acc + (s.score ?? 0), 0) /
            submissions.length,
        )
      : 0;
  const acRate =
    submissions.length > 0
      ? Math.round((acCount / submissions.length) * 100)
      : 0;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
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
        <span style={{ color: "var(--color-text-primary)" }}>
          {assignment.title}
        </span>
      </div>

      {/* Header */}
      <div
        style={{
          marginBottom: 32,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            {assignment.title}
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
            }}
          >
            {course.name}
          </p>
        </div>
        <Link
          href={`/teacher/classes/${classId}/assignments/${assignmentId}/edit`}
          style={{
            fontSize: "0.8125rem",
            color: "var(--color-text-secondary)",
            textDecoration: "none",
            padding: "6px 14px",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            background: "var(--color-surface)",
            fontWeight: 500,
          }}
        >
          編集
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {unreturnedCount > 0 ? (
          <button
            type="button"
            onClick={handleReturn}
            disabled={isReturning}
            style={{
              padding: "8px 20px",
              background: isReturning ? "#b0c8ef" : "var(--color-primary)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: isReturning ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {isReturning ? "返却中..." : `最新提出を一括返却（${unreturnedCount}名）`}
          </button>
        ) : (
          submissions.length > 0 && (
            <span
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-primary)",
                fontWeight: 500,
                padding: "8px 0",
              }}
            >
              ✓ 全員の最新提出を返却済み
            </span>
          )
        )}
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          background: "var(--color-border)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        {[
          { label: "提出数", value: submissions.length },
          { label: "AC", value: acCount, color: "var(--color-success)" },
          { label: "AC率", value: `${acRate}%` },
          {
            label: "平均点",
            value: `${avgScore}/${assignment.maxScore ?? "—"}`,
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{ background: "var(--color-surface)", padding: "16px 20px" }}
          >
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              {s.label}
            </p>
            <p
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: s.color ?? "var(--color-text-primary)",
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 80px 80px 80px 120px 24px",
            padding: "12px 20px",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-bg)",
          }}
        >
          {["学生名", "得点", "結果", "返却", "提出日時", ""].map((h) => (
            <span
              key={h}
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {submissions.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
            }}
          >
            まだ提出がありません
          </div>
        ) : (
          submissions.map((sub, idx) => (
            <Link
              key={sub.id}
              href={`/teacher/classes/${classId}/assignments/${assignmentId}/submissions/${sub.id}`}
              className="card-link"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 80px 80px 120px 24px",
                alignItems: "center",
                padding: "14px 20px",
                borderBottom:
                  idx < submissions.length - 1
                    ? "1px solid var(--color-divider)"
                    : "none",
              }}
            >
              {/* Student */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--color-primary-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--color-primary)",
                    flexShrink: 0,
                  }}
                >
                  {(sub.userName ?? "?").charAt(0)}
                </div>
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {sub.userName ?? "—"}
                </span>
              </div>

              {/* Score */}
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {sub.score ?? "—"}
                <span
                  style={{ fontWeight: 400, color: "var(--color-text-muted)" }}
                >
                  /{assignment.maxScore ?? "—"}
                </span>
              </span>

              {/* Status */}
              <JudgeBadge status={overallStatus(sub.judgeResults)} size="sm" />

              {/* Returned */}
              {latestPerUser.get(sub.userId ?? "")?.id === sub.id ? (
                sub.returned ? (
                  <span style={{ fontSize: "0.6875rem", background: "var(--color-primary-subtle)", color: "var(--color-primary)", border: "1px solid var(--color-primary-surface)", borderRadius: 4, padding: "2px 8px", fontWeight: 500 }}>
                    返却済
                  </span>
                ) : (
                  <span style={{ fontSize: "0.6875rem", background: "var(--color-warning-surface)", color: "var(--color-warning)", border: "1px solid #fcd68a", borderRadius: 4, padding: "2px 8px", fontWeight: 500 }}>
                    未返却
                  </span>
                )
              ) : (
                <span style={{ fontSize: "0.6875rem", background: "var(--color-neutral-surface)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)", borderRadius: 4, padding: "2px 8px", fontWeight: 500 }}>
                  旧版
                </span>
              )}

              {/* Date */}
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                }}
              >
                {sub.submittedAt
                  ? new Intl.DateTimeFormat("ja-JP", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(sub.submittedAt))
                  : "—"}
              </span>

              <span style={{ color: "var(--color-text-muted)" }}>›</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

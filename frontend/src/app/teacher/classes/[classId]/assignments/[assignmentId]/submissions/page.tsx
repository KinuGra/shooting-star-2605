"use client";

import Link from "next/link";
import { use, useState } from "react";
import { JudgeBadge } from "@/components/Badge";
import { useGetAssignment, useGetTestCases } from "@/api/generated/assignments/assignments";
import { useGetCourse } from "@/api/generated/courses/courses";
import {
  useGetSubmissions,
  useReturnSubmissions,
} from "@/api/generated/submissions/submissions";
import type { JudgeResultResponse, SubmissionResponse, TestCaseResponse } from "@/api/model";
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

const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  CODE: "コード",
  FILE: "ファイル",
  REPORT: "レポート",
};

interface Props {
  params: Promise<{ classId: string; assignmentId: string }>;
}

export default function SubmissionsListPage({ params }: Props) {
  const { classId, assignmentId } = use(params);
  const [tab, setTab] = useState<"submissions" | "detail">("submissions");

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
  const { data: tcData } = useGetTestCases(assignmentId);
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
  const testCases: TestCaseResponse[] = [
    ...((tcData?.data as TestCaseResponse[] | undefined) ?? []),
  ].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

  const acCount = submissions.filter(
    (s) => overallStatus(s.judgeResults) === "AC",
  ).length;
  const latestPerUser = new Map<string, SubmissionResponse>();
  for (const s of submissions) {
    const uid = s.userId ?? "";
    const existing = latestPerUser.get(uid);
    if (
      !existing ||
      new Date(s.submittedAt ?? "") > new Date(existing.submittedAt ?? "")
    ) {
      latestPerUser.set(uid, s);
    }
  }
  const unreturnedCount = [...latestPerUser.values()].filter(
    (s) => !s.returned,
  ).length;

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

  const tabBtnStyle = (active: boolean) => ({
    padding: "6px 16px",
    background: active ? "var(--color-primary)" : "transparent",
    color: active ? "#fff" : "var(--color-text-secondary)",
    border: "1px solid",
    borderColor: active ? "var(--color-primary)" : "var(--color-border)",
    borderRadius: 6,
    fontSize: "0.8125rem",
    fontWeight: 500 as const,
    cursor: "pointer" as const,
  });

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
          marginBottom: 24,
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

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
        }}
      >
        <button
          type="button"
          style={tabBtnStyle(tab === "submissions")}
          onClick={() => setTab("submissions")}
        >
          提出一覧
        </button>
        <button
          type="button"
          style={tabBtnStyle(tab === "detail")}
          onClick={() => setTab("detail")}
        >
          課題詳細
        </button>
      </div>

      {/* ── 提出一覧 tab ── */}
      {tab === "submissions" && (
        <>
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
                {isReturning
                  ? "返却中..."
                  : `最新提出を一括返却（${unreturnedCount}名）`}
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
                style={{
                  background: "var(--color-surface)",
                  padding: "16px 20px",
                }}
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
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
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
                      style={{
                        fontWeight: 400,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      /{assignment.maxScore ?? "—"}
                    </span>
                  </span>

                  <JudgeBadge
                    status={overallStatus(sub.judgeResults)}
                    size="sm"
                  />

                  {latestPerUser.get(sub.userId ?? "")?.id === sub.id ? (
                    sub.returned ? (
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          background: "var(--color-primary-subtle)",
                          color: "var(--color-primary)",
                          border: "1px solid var(--color-primary-surface)",
                          borderRadius: 4,
                          padding: "2px 8px",
                          fontWeight: 500,
                        }}
                      >
                        返却済
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          background: "var(--color-warning-surface)",
                          color: "var(--color-warning)",
                          border: "1px solid #fcd68a",
                          borderRadius: 4,
                          padding: "2px 8px",
                          fontWeight: 500,
                        }}
                      >
                        未返却
                      </span>
                    )
                  ) : (
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        background: "var(--color-neutral-surface)",
                        color: "var(--color-text-muted)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 4,
                        padding: "2px 8px",
                        fontWeight: 500,
                      }}
                    >
                      旧版
                    </span>
                  )}

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
        </>
      )}

      {/* ── 課題詳細 tab ── */}
      {tab === "detail" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* メタ情報 */}
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
                基本情報
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1,
                background: "var(--color-border)",
              }}
            >
              {[
                {
                  label: "提出期限",
                  value: assignment.deadlineAt
                    ? new Intl.DateTimeFormat("ja-JP", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(assignment.deadlineAt))
                    : "—",
                },
                {
                  label: "満点",
                  value: assignment.maxScore != null ? `${assignment.maxScore}点` : "—",
                },
                {
                  label: "提出タイプ",
                  value:
                    SUBMISSION_TYPE_LABELS[assignment.submissionType ?? ""] ??
                    assignment.submissionType ??
                    "—",
                },
                {
                  label: "対応言語",
                  value:
                    (assignment.languages ?? []).length > 0
                      ? (assignment.languages ?? []).join(", ")
                      : "—",
                },
                {
                  label: "公開状態",
                  value: assignment.isPublished ? "公開中" : "非公開",
                },
                {
                  label: "テストケース数",
                  value: `${testCases.length}件`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "var(--color-surface)",
                    padding: "14px 20px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.6875rem",
                      color: "var(--color-text-muted)",
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 課題内容 */}
          {assignment.description && (
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
                  課題の内容
                </p>
              </div>
              <div style={{ padding: "20px 24px" }}>
                <pre
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                    fontFamily: "inherit",
                    margin: 0,
                  }}
                >
                  {assignment.description}
                </pre>
              </div>
            </div>
          )}

          {/* テストケース一覧 */}
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
                padding: "14px 20px",
                borderBottom: "1px solid var(--color-border)",
                background: "var(--color-bg)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <p
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                テストケース
              </p>
              <span
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--color-text-muted)",
                  background: "var(--color-neutral-surface)",
                  borderRadius: 10,
                  padding: "1px 7px",
                }}
              >
                {testCases.length}件
              </span>
            </div>

            {testCases.length === 0 ? (
              <div
                style={{
                  padding: "32px 24px",
                  textAlign: "center",
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                }}
              >
                テストケースがありません
              </div>
            ) : (
              testCases.map((tc, idx) => (
                <div
                  key={tc.id ?? idx}
                  style={{
                    borderBottom:
                      idx < testCases.length - 1
                        ? "1px solid var(--color-divider)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 20px",
                      background: "var(--color-bg)",
                      borderBottom: "1px solid var(--color-divider)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      ケース {idx + 1}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      配点: {tc.score ?? 0}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 0,
                    }}
                  >
                    <div
                      style={{
                        padding: "12px 20px",
                        borderRight: "1px solid var(--color-divider)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--color-text-muted)",
                          marginBottom: 6,
                        }}
                      >
                        入力
                      </p>
                      <pre
                        className="code-editor"
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--color-text-primary)",
                          margin: 0,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                        }}
                      >
                        {tc.input || "（空）"}
                      </pre>
                    </div>
                    <div style={{ padding: "12px 20px" }}>
                      <p
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--color-text-muted)",
                          marginBottom: 6,
                        }}
                      >
                        期待される出力
                      </p>
                      <pre
                        className="code-editor"
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--color-text-primary)",
                          margin: 0,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                        }}
                      >
                        {tc.expectedOutput || "（空）"}
                      </pre>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

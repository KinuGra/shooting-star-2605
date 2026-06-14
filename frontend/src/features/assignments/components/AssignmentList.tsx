"use client";

import Link from "next/link";
import { useGetAssignments } from "@/api/generated/assignments/assignments";
import { useGetSubmissions } from "@/api/generated/submissions/submissions";
import type { AssignmentResponse, SubmissionResponse } from "@/api/model";

function fmtDeadline(iso: string) {
  const d = new Date(iso);
  const isPast = d < new Date();
  const label = new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return { label: isPast ? `${label} (締切)` : label, isPast };
}

function StudentScore({ assignmentId, maxScore }: { assignmentId: string; maxScore?: number | null }) {
  const { data } = useGetSubmissions(assignmentId);
  const submissions = (data?.data as SubmissionResponse[] | undefined) ?? [];
  if (submissions.length === 0) return <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>{maxScore ?? "—"}</span>;
  const latest = submissions.sort((a, b) => new Date(b.submittedAt ?? "").getTime() - new Date(a.submittedAt ?? "").getTime())[0];
  const score = latest.score ?? "—";
  return (
    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums" }}>
      {score}<span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>/{maxScore ?? "—"}</span>
    </span>
  );
}

interface Props {
  courseId: string;
  role: "student" | "teacher";
}

export function AssignmentList({ courseId, role }: Props) {
  const { data, isLoading, error } = useGetAssignments(courseId);

  if (isLoading) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--color-text-muted)",
          fontSize: "0.875rem",
        }}
      >
        読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--color-danger)",
          fontSize: "0.875rem",
        }}
      >
        課題の読み込みに失敗しました。
      </div>
    );
  }

  const assignments = (data?.data as AssignmentResponse[]) ?? [];

  return (
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
          gridTemplateColumns: "40px 1fr 160px 80px 24px",
          gap: 0,
          padding: "12px 20px",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-bg)",
        }}
      >
        {["#", "課題名", "期限", role === "student" ? "得点" : "満点", ""].map((h) => (
          <span
            key={h}
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: "var(--color-text-muted)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {assignments.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
          }}
        >
          課題がまだありません
        </div>
      ) : (
        assignments.map((assignment, idx) => {
          const { label: dl, isPast } = fmtDeadline(
            assignment.deadlineAt ?? "",
          );
          const href =
            role === "student"
              ? `/student/classes/${courseId}/assignments/${assignment.id}`
              : `/teacher/classes/${courseId}/assignments/${assignment.id}/submissions`;
          return (
            <Link
              key={assignment.id}
              href={href}
              className="card-link"
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr 160px 80px 24px",
                alignItems: "center",
                padding: "14px 20px",
                borderBottom:
                  idx < assignments.length - 1
                    ? "1px solid var(--color-divider)"
                    : "none",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {idx + 1}
              </span>
              <div>
                <span
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--color-text-primary)",
                    fontWeight: 500,
                  }}
                >
                  {assignment.title}
                </span>
                {!assignment.isPublished && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: "0.6875rem",
                      background: "var(--color-warning-surface)",
                      color: "var(--color-warning)",
                      border: "1px solid #fcd68a",
                      borderRadius: 4,
                      padding: "1px 6px",
                    }}
                  >
                    非公開
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: isPast
                    ? "var(--color-danger)"
                    : "var(--color-text-muted)",
                }}
              >
                {dl}
              </span>
              {role === "student" ? (
                <StudentScore assignmentId={assignment.id ?? ""} maxScore={assignment.maxScore} />
              ) : (
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums" }}>
                  {assignment.maxScore ?? "—"}
                </span>
              )}
              <span
                style={{ color: "var(--color-text-muted)", fontSize: "1rem" }}
              >
                ›
              </span>
            </Link>
          );
        })
      )}
    </div>
  );
}

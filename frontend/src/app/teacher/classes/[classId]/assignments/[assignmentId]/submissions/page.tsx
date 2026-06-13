import type { Metadata } from "next";
import Link from "next/link";
import { JudgeBadge } from "@/components/Badge";
import { MOCK_ASSIGNMENTS, MOCK_CLASSES, getSubmissionsForAssignment } from "@/lib/mock-data";

export const metadata: Metadata = { title: "提出物一覧" };

interface Props { params: Promise<{ classId: string; assignmentId: string }> }

export default async function SubmissionsListPage({ params }: Props) {
  const { classId, assignmentId } = await params;
  const assignment = MOCK_ASSIGNMENTS.find((a) => a.id === assignmentId);
  const cls = MOCK_CLASSES.find((c) => c.id === classId);
  const submissions = getSubmissionsForAssignment(assignmentId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  if (!assignment || !cls) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <p style={{ color: "var(--color-text-muted)" }}>課題が見つかりません</p>
    </div>
  );

  const acCount = submissions.filter((s) => s.status === "AC").length;
  const avgScore = submissions.length > 0
    ? Math.round(submissions.reduce((s, sub) => s + sub.score, 0) / submissions.length)
    : 0;
  const acRate = submissions.length > 0 ? Math.round((acCount / submissions.length) * 100) : 0;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 28, fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
        <Link href="/teacher" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>ダッシュボード</Link>
        <span>›</span>
        <Link href={`/teacher/classes/${classId}`} style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>{cls.name}</Link>
        <span>›</span>
        <span style={{ color: "var(--color-text-primary)" }}>{assignment.title}</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
          {assignment.title}
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>{cls.name}</p>
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
          { label: "AC",    value: acCount,  color: "var(--color-success)" },
          { label: "AC率",  value: `${acRate}%` },
          { label: "平均点", value: `${avgScore}/${assignment.maxScore}` },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--color-surface)", padding: "16px 20px" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 500, marginBottom: 4 }}>{s.label}</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.02em", color: s.color ?? "var(--color-text-primary)" }}>
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
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 80px 80px 80px 120px 24px",
            padding: "12px 20px",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-bg)",
          }}
        >
          {["学生名", "得点", "結果", "コメント", "提出日時", ""].map((h) => (
            <span key={h} style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {h}
            </span>
          ))}
        </div>

        {submissions.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
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
                borderBottom: idx < submissions.length - 1 ? "1px solid var(--color-divider)" : "none",
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
                  {sub.studentName.charAt(0)}
                </div>
                <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--color-text-primary)" }}>
                  {sub.studentName}
                </span>
              </div>

              {/* Score */}
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums" }}>
                {sub.score}
                <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>/{sub.maxScore}</span>
              </span>

              {/* Status */}
              <JudgeBadge status={sub.status} size="sm" />

              {/* Comment */}
              {sub.teacherComment ? (
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
                  確認済
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
                  未確認
                </span>
              )}

              {/* Date */}
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(sub.submittedAt))}
              </span>

              <span style={{ color: "var(--color-text-muted)" }}>›</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

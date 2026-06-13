import type { Metadata } from "next";
import Link from "next/link";
import { JudgeBadge } from "@/components/Badge";
import { ScoreBar } from "@/components/ScoreBar";
import { MOCK_CLASSES, getAssignmentSummaries, getClassGrades } from "@/lib/mock-data";

export const metadata: Metadata = { title: "課題一覧" };

function fmtDeadline(iso: string) {
  const d = new Date(iso);
  const isPast = d < new Date();
  const label = new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
  return { label: isPast ? `${label} (締切)` : label, isPast };
}

interface Props { params: Promise<{ classId: string }> }

export default async function ClassPage({ params }: Props) {
  const { classId } = await params;
  const cls = MOCK_CLASSES.find((c) => c.id === classId);
  const summaries = getAssignmentSummaries(classId);
  const grade = getClassGrades().find((g) => g.classId === classId);

  if (!cls) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <p style={{ color: "var(--color-text-muted)" }}>授業が見つかりません</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
        <Link href="/student" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>マイ授業</Link>
        <span>›</span>
        <span style={{ color: "var(--color-text-primary)" }}>{cls.name}</span>
      </div>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
            {cls.name}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>{cls.teacherName}</p>
        </div>
        {grade && (
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              padding: "16px 20px",
              minWidth: 200,
            }}
          >
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: 8, fontWeight: 500 }}>自分の成績</p>
            <ScoreBar score={grade.totalScore} max={grade.maxTotalScore} size="sm" />
            <p style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              課題完了 {grade.completedAssignments}/{grade.totalAssignments}
            </p>
          </div>
        )}
      </div>

      {/* Assignment table */}
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px 1fr 160px 80px 80px 24px",
            gap: 0,
            padding: "12px 20px",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-bg)",
          }}
        >
          {["#", "課題名", "期限", "得点", "結果", ""].map((h) => (
            <span key={h} style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--color-text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {h}
            </span>
          ))}
        </div>

        {summaries.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            課題がまだありません
          </div>
        ) : (
          summaries.map(({ assignment, myLastSubmission }, idx) => {
            const { label: dl, isPast } = fmtDeadline(assignment.deadline);
            return (
              <Link
                key={assignment.id}
                href={`/student/classes/${classId}/assignments/${assignment.id}`}
                className="card-link"
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 1fr 160px 80px 80px 24px",
                  alignItems: "center",
                  padding: "14px 20px",
                  borderBottom: idx < summaries.length - 1 ? "1px solid var(--color-divider)" : "none",
                }}
              >
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontVariantNumeric: "tabular-nums" }}>
                  {idx + 1}
                </span>
                <span style={{ fontSize: "0.9rem", color: "var(--color-text-primary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {assignment.title}
                </span>
                <span style={{ fontSize: "0.75rem", color: isPast ? "var(--color-danger)" : "var(--color-text-muted)" }}>
                  {dl}
                </span>
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums" }}>
                  {myLastSubmission ? `${myLastSubmission.score}/${assignment.maxScore}` : "—"}
                </span>
                <span>
                  {myLastSubmission ? (
                    <JudgeBadge status={myLastSubmission.status} size="sm" />
                  ) : (
                    <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: 4, padding: "2px 8px" }}>
                      未提出
                    </span>
                  )}
                </span>
                <span style={{ color: "var(--color-text-muted)", fontSize: "1rem" }}>›</span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

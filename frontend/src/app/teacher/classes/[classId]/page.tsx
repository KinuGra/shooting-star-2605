import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/Badge";
import { MOCK_ASSIGNMENTS, MOCK_CLASSES, getSubmissionsForAssignment } from "@/lib/mock-data";

export const metadata: Metadata = { title: "授業管理" };

interface Props { params: Promise<{ classId: string }> }

export default async function TeacherClassPage({ params }: Props) {
  const { classId } = await params;
  const cls = MOCK_CLASSES.find((c) => c.id === classId);
  const assignments = MOCK_ASSIGNMENTS.filter((a) => a.classId === classId);

  if (!cls) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <p style={{ color: "var(--color-text-muted)" }}>授業が見つかりません</p>
    </div>
  );

  const stats = assignments.map((a) => {
    const subs = getSubmissionsForAssignment(a.id);
    return {
      assignment: a,
      submissionCount: subs.length,
      acCount: subs.filter((s) => s.status === "AC").length,
      ungradedCount: subs.filter((s) => !s.teacherComment).length,
    };
  });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
        <Link href="/teacher" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>ダッシュボード</Link>
        <span>›</span>
        <span style={{ color: "var(--color-text-primary)" }}>{cls.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 32, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginBottom: 6 }}>
            {cls.name}
          </h1>
          <div style={{ display: "flex", gap: 16, fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
            <span>受講者 {cls.studentCount}名</span>
            <span>招待コード: <code style={{ fontFamily: "var(--font-geist-mono, monospace)", color: "var(--color-text-secondary)" }}>{cls.inviteCode}</code></span>
          </div>
        </div>
        <Link
          href={`/teacher/classes/${classId}/assignments/new`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: "var(--color-primary)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: "0.875rem",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          + 課題を追加
        </Link>
      </div>

      {/* Assignments table */}
      <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 16 }}>課題一覧</h2>

      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 100px 80px 80px 80px 120px",
            gap: 0,
            padding: "12px 20px",
            borderBottom: "1px solid var(--color-border)",
            background: "var(--color-bg)",
          }}
        >
          {["課題名", "期限", "提出数", "AC", "未確認", ""].map((h) => (
            <span key={h} style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {h}
            </span>
          ))}
        </div>

        {stats.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            課題がまだありません。
            <Link href={`/teacher/classes/${classId}/assignments/new`} style={{ color: "var(--color-primary)", textDecoration: "none", marginLeft: 4 }}>
              最初の課題を作成する
            </Link>
          </div>
        ) : (
          stats.map(({ assignment, submissionCount, acCount, ungradedCount }, idx) => {
            const isPast = new Date(assignment.deadline) < new Date();
            const dl = new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" }).format(new Date(assignment.deadline));
            return (
              <div
                key={assignment.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 80px 80px 80px 120px",
                  alignItems: "center",
                  padding: "14px 20px",
                  borderBottom: idx < stats.length - 1 ? "1px solid var(--color-divider)" : "none",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--color-text-primary)" }}>
                      {assignment.title}
                    </span>
                    {!assignment.isPublic && <StatusBadge label="非公開" variant="warning" />}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{assignment.language} · {assignment.maxScore}点</span>
                </div>
                <span style={{ fontSize: "0.8125rem", color: isPast ? "var(--color-danger)" : "var(--color-text-muted)" }}>
                  {dl}{isPast ? " 締切" : ""}
                </span>
                <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{submissionCount}</span>
                <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-success)" }}>{acCount}</span>
                <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: ungradedCount > 0 ? "var(--color-warning)" : "var(--color-text-muted)" }}>
                  {ungradedCount}
                </span>
                <Link
                  href={`/teacher/classes/${classId}/assignments/${assignment.id}/submissions`}
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--color-primary)",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  提出物を確認 ›
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { getTeacherClasses } from "@/lib/mock-data";

export const metadata: Metadata = { title: "教員ダッシュボード" };

export default function TeacherDashboard() {
  const classes = getTeacherClasses();
  const totalStudents = classes.reduce((s, c) => s + c.studentCount, 0);
  const totalUngraded = classes.reduce((s, c) => s + c.ungradedCount, 0);
  const totalGraded = classes.reduce((s, c) => s + c.gradedCount, 0);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
          ダッシュボード
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>田中 誠 — 担当授業の管理</p>
      </div>

      {/* Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          background: "var(--color-border)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 32,
        }}
      >
        {[
          { label: "担当授業数",  value: classes.length,   sub: "件" },
          { label: "受講学生数",  value: totalStudents,    sub: "名" },
          { label: "未採点",     value: totalUngraded,    sub: "件", highlight: totalUngraded > 0 },
          { label: "採点済み",   value: totalGraded,      sub: "件" },
        ].map((m) => (
          <div key={m.label} style={{ background: "var(--color-surface)", padding: "20px 24px" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: 6, fontWeight: 500 }}>{m.label}</p>
            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: m.highlight ? "var(--color-warning)" : "var(--color-text-primary)",
              }}
            >
              {m.value}
              <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--color-text-muted)", marginLeft: 2 }}>{m.sub}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Ungraded notice */}
      {totalUngraded > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--color-warning-surface)",
            border: "1px solid #fcd68a",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 24,
            fontSize: "0.875rem",
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-warning)", flexShrink: 0 }} />
          <p style={{ color: "#78350f" }}>
            未採点の提出が <strong>{totalUngraded} 件</strong> あります。各授業から確認できます。
          </p>
        </div>
      )}

      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)" }}>担当授業</h2>
        <Link href="/teacher/classes/new" style={{ fontSize: "0.8125rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>
          + 授業を作成
        </Link>
      </div>

      {/* Class list */}
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {classes.map((cls, idx) => (
          <div
            key={cls.id}
            style={{
              padding: "20px 24px",
              borderBottom: idx < classes.length - 1 ? "1px solid var(--color-divider)" : "none",
              display: "flex",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            {/* Class icon + info */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 200 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: "var(--color-primary-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  flexShrink: 0,
                }}
              >
                {cls.name.charAt(0)}
              </div>
              <div>
                <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 2 }}>
                  {cls.name}
                </p>
                <div style={{ display: "flex", gap: 12, fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  <span>受講者 {cls.studentCount}名</span>
                  <span>課題 {cls.assignmentCount}件</span>
                  <span style={{ fontFamily: "var(--font-geist-mono, monospace)" }}>招待コード: {cls.inviteCode}</span>
                </div>
              </div>
            </div>

            {/* Grading status */}
            <div style={{ display: "flex", gap: 20, textAlign: "center" }}>
              <div>
                <p style={{ fontSize: "1.125rem", fontWeight: 700, color: cls.ungradedCount > 0 ? "var(--color-warning)" : "var(--color-text-muted)" }}>
                  {cls.ungradedCount}
                </p>
                <p style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>未採点</p>
              </div>
              <div>
                <p style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-success)" }}>
                  {cls.gradedCount}
                </p>
                <p style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>採点済</p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <Link
                href={`/teacher/classes/${cls.id}/assignments/new`}
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-text-secondary)",
                  textDecoration: "none",
                  padding: "6px 12px",
                  border: "1px solid var(--color-border)",
                  borderRadius: 6,
                  background: "var(--color-bg)",
                  fontWeight: 500,
                }}
              >
                + 課題
              </Link>
              <Link
                href={`/teacher/classes/${cls.id}`}
                style={{
                  fontSize: "0.8125rem",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: 6,
                  background: "var(--color-primary)",
                  fontWeight: 500,
                }}
              >
                管理する
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create new class placeholder */}
      <Link
        href="/teacher/classes/new"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 12,
          padding: 16,
          border: "1px dashed var(--color-border)",
          borderRadius: 12,
          fontSize: "0.875rem",
          color: "var(--color-text-muted)",
          textDecoration: "none",
        }}
      >
        + 新しい授業を作成する
      </Link>
    </div>
  );
}

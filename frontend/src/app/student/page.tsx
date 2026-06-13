import type { Metadata } from "next";
import Link from "next/link";
import { ScoreBar } from "@/components/ScoreBar";
import { getClassGrades } from "@/lib/mock-data";

export const metadata: Metadata = { title: "マイ授業" };

export default function StudentDashboard() {
  const grades = getClassGrades();
  const totalScore = grades.reduce((s, g) => s + g.totalScore, 0);
  const totalMax = grades.reduce((s, g) => s + g.maxTotalScore, 0);
  const overallPct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
          山田 太郎
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
          受講授業 {grades.length} 件
        </p>
      </div>

      {/* Summary metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
          background: "var(--color-border)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 32,
        }}
      >
        {[
          { label: "総合スコア", value: `${totalScore} / ${totalMax}` },
          { label: "達成率",     value: `${overallPct}%` },
          { label: "受講授業数", value: `${grades.length} 件` },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              background: "var(--color-surface)",
              padding: "20px 24px",
            }}
          >
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: 6, fontWeight: 500 }}>
              {m.label}
            </p>
            <p style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
          受講中の授業
        </h2>
        <Link
          href="/student/classes/join"
          style={{ fontSize: "0.8125rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}
        >
          + 授業に参加
        </Link>
      </div>

      {/* Class list */}
      <div
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          overflow: "hidden",
          background: "var(--color-surface)",
        }}
      >
        {grades.map((g, idx) => (
          <Link
            key={g.classId}
            href={`/student/classes/${g.classId}`}
            className="row-link"
            style={{
              gap: 16,
              padding: "18px 24px",
              borderBottom: idx < grades.length - 1 ? "1px solid var(--color-divider)" : "none",
              background: "var(--color-surface)",
            }}
          >
            {/* Icon */}
            <div
              style={{
                flexShrink: 0,
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
              }}
            >
              {g.className.charAt(0)}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.9375rem", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 2 }}>
                {g.className}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                {g.teacherName}
              </p>
            </div>

            {/* Score bar */}
            <div style={{ width: 160, flexShrink: 0 }}>
              <ScoreBar score={g.totalScore} max={g.maxTotalScore} size="sm" />
            </div>

            {/* Completion */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)" }}>
                {g.completedAssignments}/{g.totalAssignments}
              </p>
              <p style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>課題完了</p>
            </div>

            {/* Arrow */}
            <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", flexShrink: 0 }}>›</span>
          </Link>
        ))}
      </div>

      {/* Join new class */}
      <Link
        href="/student/classes/join"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 12,
          padding: "16px",
          border: "1px dashed var(--color-border)",
          borderRadius: 12,
          fontSize: "0.875rem",
          color: "var(--color-text-muted)",
          textDecoration: "none",
          background: "transparent",
        }}
      >
        + 新しい授業に参加する
      </Link>
    </div>
  );
}

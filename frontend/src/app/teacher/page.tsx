import type { Metadata } from "next";
import Link from "next/link";
import { TeacherCourseList } from "@/features/courses/components/CourseList";

export const metadata: Metadata = { title: "教員ダッシュボード" };

export default function TeacherDashboard() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: 4,
          }}
        >
          ダッシュボード
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          担当授業
        </h2>
        <Link
          href="/teacher/classes/new"
          style={{
            fontSize: "0.8125rem",
            color: "var(--color-primary)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          + 授業を作成
        </Link>
      </div>

      <TeacherCourseList />

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

import type { Metadata } from "next";
import Link from "next/link";
import { StudentCourseList } from "@/features/courses/components/CourseList";

export const metadata: Metadata = { title: "マイ授業" };

export default function StudentDashboard() {
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
          マイ授業
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
          受講中の授業
        </h2>
        <Link
          href="/student/classes/join"
          style={{
            fontSize: "0.8125rem",
            color: "var(--color-primary)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          + 授業に参加
        </Link>
      </div>

      <StudentCourseList />

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

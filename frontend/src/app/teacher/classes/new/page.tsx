import type { Metadata } from "next";
import Link from "next/link";
import { CreateCourseForm } from "@/features/courses/components/CreateCourseForm";

export const metadata: Metadata = { title: "授業を作成" };

export default function NewClassPage() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 64px)",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <Link
          href="/teacher"
          style={{
            fontSize: "0.875rem",
            color: "var(--color-text-secondary)",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 24,
          }}
        >
          ← ダッシュボード
        </Link>

        <CreateCourseForm />
      </div>
    </div>
  );
}

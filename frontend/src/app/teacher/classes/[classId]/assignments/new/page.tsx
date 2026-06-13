import type { Metadata } from "next";
import Link from "next/link";
import { CreateAssignmentForm } from "@/features/assignments/components/CreateAssignmentForm";

export const metadata: Metadata = { title: "課題を作成" };

interface Props {
  params: Promise<{ classId: string }>;
}

export default async function NewAssignmentPage({ params }: Props) {
  const { classId } = await params;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
      <div
        style={{
          display: "flex",
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
          授業管理
        </Link>
        <span>›</span>
        <span style={{ color: "var(--color-text-primary)" }}>課題を作成</span>
      </div>

      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          color: "var(--color-text-primary)",
          letterSpacing: "-0.02em",
          marginBottom: 32,
        }}
      >
        課題を作成
      </h1>

      <CreateAssignmentForm courseId={classId} />
    </div>
  );
}

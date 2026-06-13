import type { Metadata } from "next";
import Link from "next/link";
import { AssignmentList } from "@/features/assignments/components/AssignmentList";

export const metadata: Metadata = { title: "課題一覧" };

interface Props {
  params: Promise<{ classId: string }>;
}

export default async function ClassPage({ params }: Props) {
  const { classId } = await params;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
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
          href="/student"
          style={{
            color: "var(--color-text-secondary)",
            textDecoration: "none",
          }}
        >
          マイ授業
        </Link>
        <span>›</span>
        <span style={{ color: "var(--color-text-primary)" }}>授業</span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 32,
          flexWrap: "wrap",
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          課題一覧
        </h1>
      </div>

      <AssignmentList courseId={classId} role="student" />
    </div>
  );
}

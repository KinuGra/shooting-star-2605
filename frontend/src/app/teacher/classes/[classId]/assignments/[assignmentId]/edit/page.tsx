"use client";

import Link from "next/link";
import { use } from "react";
import { useGetAssignment } from "@/api/generated/assignments/assignments";
import { EditAssignmentForm } from "@/features/assignments/components/EditAssignmentForm";

interface Props {
  params: Promise<{ classId: string; assignmentId: string }>;
}

export default function EditAssignmentPage({ params }: Props) {
  const { classId, assignmentId } = use(params);
  const { data, isLoading } = useGetAssignment(assignmentId);

  if (isLoading || !data?.data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "var(--color-text-muted)" }}>
        読み込み中...
      </div>
    );
  }

  const assignment = data.data;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
        <Link href="/teacher" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>ダッシュボード</Link>
        <span>›</span>
        <Link href={`/teacher/classes/${classId}`} style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>授業管理</Link>
        <span>›</span>
        <Link href={`/teacher/classes/${classId}/assignments/${assignmentId}/submissions`} style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>{assignment.title}</Link>
        <span>›</span>
        <span style={{ color: "var(--color-text-primary)" }}>編集</span>
      </div>

      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginBottom: 32 }}>
        課題を編集
      </h1>

      <EditAssignmentForm assignment={assignment} courseId={classId} />
    </div>
  );
}

"use client";

import { use } from "react";
import { useGetAssignment } from "@/api/generated/assignments/assignments";
import { SubmitCodeForm } from "@/features/assignments/components/SubmitCodeForm";
import type { AssignmentResponse } from "@/api/model";

interface Props {
  params: Promise<{ classId: string; assignmentId: string }>;
}

export default function AssignmentPage({ params }: Props) {
  const { classId, assignmentId } = use(params);
  const { data, isLoading, error } = useGetAssignment(assignmentId);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          color: "var(--color-text-muted)",
        }}
      >
        読み込み中...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          color: "var(--color-text-muted)",
        }}
      >
        課題が見つかりません
      </div>
    );
  }

  const assignment = data.data as AssignmentResponse;

  return <SubmitCodeForm assignment={assignment} courseId={classId} />;
}

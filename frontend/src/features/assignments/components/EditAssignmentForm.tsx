"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useUpdateAssignment } from "@/api/generated/assignments/assignments";
import type { AssignmentResponse } from "@/api/model";

const LANGUAGES = ["Python", "JavaScript", "C", "C++", "Java"];

const editSchema = z.object({
  title: z.string().min(1, "課題名を入力してください"),
  description: z.string().optional(),
  isPublished: z.boolean(),
  deadlineAt: z.string().min(1, "提出期限を設定してください"),
  maxScore: z.number().min(0).optional(),
  languages: z.array(z.string()),
});

type EditFormData = z.infer<typeof editSchema>;

const inputStyle = {
  width: "100%",
  border: "1.5px solid var(--color-border)",
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: "0.9375rem",
  color: "var(--color-text-primary)",
  background: "var(--color-bg)",
  outline: "none",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "block" as const,
  fontSize: "0.8125rem",
  fontWeight: 500 as const,
  color: "var(--color-text-primary)",
  marginBottom: 6,
};

function toLocalDatetime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Props {
  assignment: AssignmentResponse;
  courseId: string;
}

export function EditAssignmentForm({ assignment, courseId }: Props) {
  const router = useRouter();
  const { trigger, isMutating } = useUpdateAssignment(assignment.id ?? "");

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: assignment.title ?? "",
      description: assignment.description ?? "",
      isPublished: assignment.isPublished ?? false,
      deadlineAt: assignment.deadlineAt ? toLocalDatetime(assignment.deadlineAt) : "",
      maxScore: assignment.maxScore ?? undefined,
      languages: assignment.languages ?? [],
    },
  });

  const isPublished = watch("isPublished");

  const onSubmit = async (data: EditFormData) => {
    try {
      await trigger({
        title: data.title,
        description: data.description,
        isPublished: data.isPublished,
        deadlineAt: new Date(data.deadlineAt).toISOString(),
        maxScore: data.maxScore,
        languages: data.languages,
      });
      router.push(`/teacher/classes/${courseId}/assignments/${assignment.id}/submissions`);
      router.refresh();
    } catch {
      setError("root", { message: "課題の更新に失敗しました。" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <section style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "24px", marginBottom: 16 }}>
        <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 20 }}>基本情報</h2>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>課題名 <span style={{ color: "var(--color-danger)" }}>*</span></label>
          <input {...register("title")} type="text" style={{ ...inputStyle, borderColor: errors.title ? "var(--color-danger)" : "var(--color-border)" }} />
          {errors.title && <p style={{ marginTop: 4, fontSize: "0.75rem", color: "var(--color-danger)" }}>{errors.title.message}</p>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>課題の内容</label>
          <textarea {...register("description")} rows={8} style={{ ...inputStyle, fontFamily: "var(--font-geist-mono, monospace)", fontSize: "0.8125rem", resize: "vertical" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>提出期限 <span style={{ color: "var(--color-danger)" }}>*</span></label>
            <input {...register("deadlineAt")} type="datetime-local" style={{ ...inputStyle, borderColor: errors.deadlineAt ? "var(--color-danger)" : "var(--color-border)" }} />
            {errors.deadlineAt && <p style={{ marginTop: 4, fontSize: "0.75rem", color: "var(--color-danger)" }}>{errors.deadlineAt.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>満点（任意）</label>
            <input {...register("maxScore", { valueAsNumber: true })} type="number" min={0} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>言語</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {LANGUAGES.map((lang) => {
                const { onChange, ...rest } = register("languages");
                return (
                  <label key={lang} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.8125rem", color: "var(--color-text-primary)", cursor: "pointer" }}>
                    <input type="checkbox" value={lang} {...rest} onChange={onChange} />
                    {lang}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input {...register("isPublished")} type="checkbox" id="isPublished" style={{ width: 16, height: 16, cursor: "pointer" }} />
          <label htmlFor="isPublished" style={{ fontSize: "0.875rem", color: "var(--color-text-primary)", cursor: "pointer" }}>学生に公開する</label>
          {!isPublished && (
            <span style={{ fontSize: "0.6875rem", background: "var(--color-warning-surface)", color: "var(--color-warning)", border: "1px solid #fcd68a", borderRadius: 4, padding: "2px 8px", fontWeight: 500 }}>非公開</span>
          )}
        </div>
      </section>

      {errors.root && <p style={{ marginBottom: 12, fontSize: "0.8125rem", color: "var(--color-danger)" }}>{errors.root.message}</p>}

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button type="submit" disabled={isMutating} style={{ padding: "10px 24px", background: isMutating ? "#b0c8ef" : "var(--color-primary)", color: "#fff", border: "none", borderRadius: 8, fontSize: "0.9375rem", fontWeight: 500, cursor: isMutating ? "not-allowed" : "pointer" }}>
          {isMutating ? "更新中..." : "課題を更新する"}
        </button>
        <Link href={`/teacher/classes/${courseId}/assignments/${assignment.id}/submissions`} style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", textDecoration: "none" }}>キャンセル</Link>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { z } from "zod";
import { useCreateCourse } from "@/api/generated/courses/courses";
import type { CourseResponse } from "@/api/model";

const createCourseSchema = z.object({
  name: z.string().min(1, "授業名を入力してください"),
  description: z.string().optional(),
});

type CreateCourseFormData = z.infer<typeof createCourseSchema>;

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

export function CreateCourseForm() {
  const [created, setCreated] = useState<CourseResponse | null>(null);
  const { trigger, isMutating } = useCreateCourse();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
  });

  const onSubmit = async (data: CreateCourseFormData) => {
    try {
      const result = await trigger({
        name: data.name,
        description: data.description,
      });
      setCreated(
        (result as unknown as { data: CourseResponse }).data ?? {
          name: data.name,
        },
      );
    } catch {
      setError("root", { message: "授業の作成に失敗しました。" });
    }
  };

  if (created) {
    return (
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          padding: "40px 32px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "var(--color-success-surface)",
            border: "1px solid #a8d5b5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "1.25rem",
            color: "var(--color-success)",
          }}
        >
          ✓
        </div>
        <h1
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            marginBottom: 6,
          }}
        >
          授業を作成しました
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--color-text-secondary)",
            marginBottom: 24,
          }}
        >
          {created.name}
        </p>

        {created.inviteCode && (
          <div
            style={{
              background: "var(--color-primary-subtle)",
              border: "1px solid var(--color-primary-surface)",
              borderRadius: 10,
              padding: "16px",
              marginBottom: 24,
            }}
          >
            <p
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                color: "var(--color-primary)",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              学生への招待コード
            </p>
            <p
              style={{
                fontFamily: "var(--font-geist-mono, monospace)",
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "var(--color-text-primary)",
              }}
            >
              {created.inviteCode}
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                marginTop: 6,
              }}
            >
              このコードを学生に共有してください
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link
            href="/teacher"
            style={{
              display: "block",
              padding: "10px",
              background: "var(--color-primary)",
              color: "#fff",
              borderRadius: 8,
              fontSize: "0.9375rem",
              fontWeight: 500,
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            ダッシュボードへ
          </Link>
          <button
            type="button"
            onClick={() => {
              setCreated(null);
              reset();
            }}
            style={{
              padding: "10px",
              background: "none",
              border: "none",
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              cursor: "pointer",
            }}
          >
            もう一つ作成する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        padding: "40px 32px",
      }}
    >
      <h1
        style={{
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "var(--color-text-primary)",
          marginBottom: 8,
          letterSpacing: "-0.02em",
        }}
      >
        授業を作成
      </h1>
      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--color-text-secondary)",
          marginBottom: 28,
          lineHeight: 1.6,
        }}
      >
        授業名を入力してください。招待コードは自動生成されます。
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="name"
            style={{
              display: "block",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--color-text-primary)",
              marginBottom: 6,
            }}
          >
            授業名 <span style={{ color: "var(--color-danger)" }}>*</span>
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            placeholder="例: データ構造・アルゴリズム"
            style={{
              ...inputStyle,
              borderColor: errors.name
                ? "var(--color-danger)"
                : "var(--color-border)",
            }}
          />
          {errors.name && (
            <p
              style={{
                marginTop: 4,
                fontSize: "0.75rem",
                color: "var(--color-danger)",
              }}
            >
              {errors.name.message}
            </p>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="description"
            style={{
              display: "block",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--color-text-primary)",
              marginBottom: 6,
            }}
          >
            説明（任意）
          </label>
          <textarea
            id="description"
            {...register("description")}
            rows={3}
            placeholder="授業の説明を入力してください（省略可）"
            style={{
              ...inputStyle,
              resize: "vertical",
            }}
          />
        </div>

        {errors.root && (
          <p
            style={{
              marginBottom: 12,
              fontSize: "0.8125rem",
              color: "var(--color-danger)",
            }}
          >
            {errors.root.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isMutating}
          style={{
            width: "100%",
            padding: "10px 16px",
            background: isMutating ? "#b0c8ef" : "var(--color-primary)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: "0.9375rem",
            fontWeight: 500,
            cursor: isMutating ? "not-allowed" : "pointer",
          }}
        >
          {isMutating ? "作成中..." : "授業を作成する"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useJoinCourse } from "@/api/generated/courses/courses";

const joinSchema = z.object({
  inviteCode: z
    .string()
    .min(1, "招待コードを入力してください")
    .max(32, "招待コードが長すぎます"),
});

type JoinFormData = z.infer<typeof joinSchema>;

export function JoinCourseForm() {
  const router = useRouter();
  const { trigger, isMutating } = useJoinCourse();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<JoinFormData>({ resolver: zodResolver(joinSchema) });

  const onSubmit = async (data: JoinFormData) => {
    try {
      await trigger({ inviteCode: data.inviteCode.trim().toUpperCase() });
      router.push("/student");
      router.refresh();
    } catch {
      setError("inviteCode", { message: "招待コードが正しくありません。" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="inviteCode"
          style={{
            display: "block",
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "var(--color-text-primary)",
            marginBottom: 6,
          }}
        >
          招待コード
        </label>
        <input
          id="inviteCode"
          type="text"
          autoComplete="off"
          spellCheck={false}
          {...register("inviteCode")}
          onChange={(e) => {
            e.target.value = e.target.value.toUpperCase();
            register("inviteCode").onChange(e);
          }}
          placeholder="例: DS2024A"
          style={{
            width: "100%",
            border: errors.inviteCode
              ? "1.5px solid var(--color-danger)"
              : "1.5px solid var(--color-border)",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: "0.9375rem",
            fontFamily: "var(--font-geist-mono, monospace)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-primary)",
            background: "var(--color-bg)",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {errors.inviteCode && (
          <p
            style={{
              marginTop: 6,
              fontSize: "0.75rem",
              color: "var(--color-danger)",
            }}
          >
            {errors.inviteCode.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isMutating}
        style={{
          width: "100%",
          padding: "10px 16px",
          background: isMutating ? "#6c9dd6" : "var(--color-primary)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: "0.9375rem",
          fontWeight: 500,
          cursor: isMutating ? "not-allowed" : "pointer",
        }}
      >
        {isMutating ? "参加中..." : "授業に参加する"}
      </button>
    </form>
  );
}

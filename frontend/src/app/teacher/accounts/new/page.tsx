"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createTeacher } from "@/api/generated/users/users";

const schema = z.object({
  name: z.string().min(1, "氏名を入力してください"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で設定してください"),
});

type FormData = z.infer<typeof schema>;

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

export default function CreateTeacherAccountPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await createTeacher({ name: data.name, email: data.email, password: data.password });
      router.push("/teacher");
    } catch {
      setError("root", { message: "作成に失敗しました。メールアドレスが既に使用されている可能性があります。" });
    }
  };

  const field = (name: keyof FormData) => ({
    ...register(name),
    style: {
      ...inputStyle,
      borderColor: errors[name] ? "var(--color-danger)" : "var(--color-border)",
    },
  });

  return (
    <div style={{ maxWidth: 480, margin: "48px auto", padding: "0 24px" }}>
      <h1
        style={{
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "var(--color-text-primary)",
          letterSpacing: "-0.02em",
          marginBottom: 8,
        }}
      >
        教師アカウントを作成
      </h1>
      <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: 32 }}>
        作成されたアカウントは教師ロールで登録されます。
      </p>

      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 16,
          padding: "32px",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>氏名</label>
            <input type="text" autoComplete="name" {...field("name")} />
            {errors.name && (
              <p style={{ marginTop: 4, fontSize: "0.75rem", color: "var(--color-danger)" }}>
                {errors.name.message}
              </p>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>メールアドレス</label>
            <input type="email" autoComplete="email" {...field("email")} />
            {errors.email && (
              <p style={{ marginTop: 4, fontSize: "0.75rem", color: "var(--color-danger)" }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>
              パスワード{" "}
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>（8文字以上）</span>
            </label>
            <input type="password" autoComplete="new-password" {...field("password")} />
            {errors.password && (
              <p style={{ marginTop: 4, fontSize: "0.75rem", color: "var(--color-danger)" }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root && (
            <p style={{ marginBottom: 12, fontSize: "0.8125rem", color: "var(--color-danger)" }}>
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "10px 16px",
              background: isSubmitting ? "#6c9dd6" : "var(--color-primary)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: "0.9375rem",
              fontWeight: 500,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "作成中..." : "アカウントを作成"}
          </button>
        </form>
      </div>
    </div>
  );
}

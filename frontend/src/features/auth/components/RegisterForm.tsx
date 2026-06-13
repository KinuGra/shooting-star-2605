"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { register as registerUser } from "@/api/generated/auth/auth";

const registerSchema = z
  .object({
    name: z.string().min(1, "氏名を入力してください"),
    email: z.string().email("有効なメールアドレスを入力してください"),
    password: z.string().min(8, "パスワードは8文字以上で設定してください"),
    confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

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

export function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email: data.email,
        name: data.name,
        password: data.password,
      });
      router.push("/auth/login?registered=1");
    } catch {
      setError("root", {
        message:
          "登録に失敗しました。このメールアドレスはすでに使用されている可能性があります。",
      });
    }
  };

  const field = (name: keyof RegisterFormData) => ({
    ...register(name),
    style: {
      ...inputStyle,
      borderColor: errors[name] ? "var(--color-danger)" : "var(--color-border)",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="name" style={labelStyle}>
          氏名
        </label>
        <input id="name" type="text" autoComplete="name" {...field("name")} />
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

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="email" style={labelStyle}>
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...field("email")}
        />
        {errors.email && (
          <p
            style={{
              marginTop: 4,
              fontSize: "0.75rem",
              color: "var(--color-danger)",
            }}
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="password" style={labelStyle}>
          パスワード{" "}
          <span
            style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}
          >
            （8文字以上）
          </span>
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...field("password")}
        />
        {errors.password && (
          <p
            style={{
              marginTop: 4,
              fontSize: "0.75rem",
              color: "var(--color-danger)",
            }}
          >
            {errors.password.message}
          </p>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="confirmPassword" style={labelStyle}>
          パスワード（確認）
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...field("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p
            style={{
              marginTop: 4,
              fontSize: "0.75rem",
              color: "var(--color-danger)",
            }}
          >
            {errors.confirmPassword.message}
          </p>
        )}
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
        {isSubmitting ? "登録中..." : "アカウントを作成"}
      </button>
    </form>
  );
}

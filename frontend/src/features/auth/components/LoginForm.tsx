"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { login, loginWithTotp } from "@/api/generated/auth/auth";
import { setAuthToken } from "@/lib/auth-client";
import type { AuthResponse } from "@/api/model";

const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

const totpSchema = z.object({
  totpCode: z
    .string()
    .length(6, "6桁のコードを入力してください")
    .regex(/^\d+$/, "数字のみ入力してください"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type TotpFormData = z.infer<typeof totpSchema>;

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

export function LoginForm() {
  const router = useRouter();
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const {
    register: registerTotp,
    handleSubmit: handleTotpSubmit,
    formState: { errors: totpErrors, isSubmitting: totpSubmitting },
  } = useForm<TotpFormData>({ resolver: zodResolver(totpSchema) });

  const completeAuth = (body: AuthResponse) => {
    if (!body.token) return;
    setAuthToken(body.token);
    if (body.role === "TEACHER" || body.role === "ADMIN") {
      router.push("/teacher");
    } else {
      router.push("/student");
    }
  };

  const onLogin = async (data: LoginFormData) => {
    setServerError("");
    try {
      const result = await login({ email: data.email, password: data.password });
      const body = result.data as AuthResponse & { tempToken?: string };

      if (body.tempToken) {
        setTempToken(body.tempToken);
        setPendingEmail(data.email);
        return;
      }
      completeAuth(body);
    } catch {
      setServerError("メールアドレスまたはパスワードが正しくありません。");
    }
  };

  const onTotp = async (data: TotpFormData) => {
    if (!tempToken) return;
    setServerError("");
    try {
      const result = await loginWithTotp({
        tempToken,
        totpCode: data.totpCode,
      });
      completeAuth(result.data as AuthResponse);
    } catch {
      setServerError("TOTPコードが正しくありません。");
    }
  };

  if (tempToken) {
    return (
      <form onSubmit={handleTotpSubmit(onTotp)}>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            marginBottom: 8,
          }}
        >
          二段階認証
        </h2>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--color-text-secondary)",
            marginBottom: 20,
          }}
        >
          {pendingEmail} の認証アプリに表示された6桁のコードを入力してください。
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>TOTPコード</label>
          <input
            {...registerTotp("totpCode")}
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            style={{
              ...inputStyle,
              fontFamily: "var(--font-geist-mono, monospace)",
              letterSpacing: "0.2em",
              textAlign: "center",
              fontSize: "1.25rem",
            }}
          />
          {totpErrors.totpCode && (
            <p
              style={{
                marginTop: 4,
                fontSize: "0.75rem",
                color: "var(--color-danger)",
              }}
            >
              {totpErrors.totpCode.message}
            </p>
          )}
        </div>

        {serverError && (
          <p
            style={{
              marginBottom: 12,
              fontSize: "0.8125rem",
              color: "var(--color-danger)",
            }}
          >
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={totpSubmitting}
          style={{
            width: "100%",
            padding: "10px 16px",
            background: totpSubmitting ? "#6c9dd6" : "var(--color-primary)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: "0.9375rem",
            fontWeight: 500,
            cursor: totpSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {totpSubmitting ? "確認中..." : "確認する"}
        </button>

        <button
          type="button"
          onClick={() => {
            setTempToken(null);
            setServerError("");
          }}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "8px",
            background: "none",
            border: "none",
            fontSize: "0.875rem",
            color: "var(--color-text-muted)",
            cursor: "pointer",
          }}
        >
          戻る
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onLogin)}>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="email" style={labelStyle}>
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
          style={{
            ...inputStyle,
            borderColor: errors.email
              ? "var(--color-danger)"
              : "var(--color-border)",
          }}
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

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="password" style={labelStyle}>
          パスワード
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          style={{
            ...inputStyle,
            borderColor: errors.password
              ? "var(--color-danger)"
              : "var(--color-border)",
          }}
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

      {serverError && (
        <p
          style={{
            marginBottom: 12,
            fontSize: "0.8125rem",
            color: "var(--color-danger)",
          }}
        >
          {serverError}
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
        {isSubmitting ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}

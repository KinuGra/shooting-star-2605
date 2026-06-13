import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = { title: "新規登録" };

export default function RegisterPage() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--color-bg)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            ShootingStar
          </p>
        </div>

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
            新規登録
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              marginBottom: 28,
            }}
          >
            学生アカウントを作成します。
          </p>

          <RegisterForm />

          <p
            style={{
              marginTop: 20,
              fontSize: "0.8125rem",
              color: "var(--color-text-muted)",
              textAlign: "center",
            }}
          >
            すでにアカウントをお持ちの方は{" "}
            <Link
              href="/auth/login"
              style={{ color: "var(--color-primary)", textDecoration: "none" }}
            >
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = { title: "ログイン" };

export default function LoginPage() {
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
            ログイン
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              marginBottom: 28,
            }}
          >
            メールアドレスとパスワードを入力してください。
          </p>

          <LoginForm />

          <p
            style={{
              marginTop: 20,
              fontSize: "0.8125rem",
              color: "var(--color-text-muted)",
              textAlign: "center",
            }}
          >
            アカウントをお持ちでない方は{" "}
            <Link
              href="/auth/register"
              style={{ color: "var(--color-primary)", textDecoration: "none" }}
            >
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

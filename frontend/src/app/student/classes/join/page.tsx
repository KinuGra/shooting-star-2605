import type { Metadata } from "next";
import Link from "next/link";
import { JoinCourseForm } from "@/features/courses/components/JoinCourseForm";

export const metadata: Metadata = { title: "授業に参加" };

export default function JoinClassPage() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "calc(100vh - 64px)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Link
          href="/student"
          style={{
            fontSize: "0.875rem",
            color: "var(--color-text-secondary)",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 24,
          }}
        >
          ← マイ授業
        </Link>

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
            授業に参加する
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            教員から共有された招待コードを入力してください。
          </p>

          <JoinCourseForm />
        </div>
      </div>
    </div>
  );
}

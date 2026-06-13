"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewClassPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ name: string; code: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const code = `${name.replace(/\s/g, "").slice(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
    setCreated({ name: name.trim(), code });
    setLoading(false);
  }

  if (created) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
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
            <h1 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 6 }}>
              授業を作成しました
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: 24 }}>{created.name}</p>

            <div
              style={{
                background: "var(--color-primary-subtle)",
                border: "1px solid var(--color-primary-surface)",
                borderRadius: 10,
                padding: "16px",
                marginBottom: 24,
              }}
            >
              <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--color-primary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
                {created.code}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 6 }}>
                このコードを学生に共有してください
              </p>
            </div>

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
                onClick={() => { setCreated(null); setName(""); }}
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
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 64px)", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <Link href="/teacher" style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", textDecoration: "none", display: "inline-block", marginBottom: 24 }}>
          ← ダッシュボード
        </Link>

        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 16,
            padding: "40px 32px",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 8, letterSpacing: "-0.02em" }}>
            授業を作成
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: 28, lineHeight: 1.6 }}>
            授業名を入力してください。招待コードは自動生成されます。
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="name"
                style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 }}
              >
                授業名
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: データ構造・アルゴリズム"
                style={{
                  width: "100%",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: "0.9375rem",
                  color: "var(--color-text-primary)",
                  background: "var(--color-bg)",
                  outline: "none",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.background = "#fff"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: loading || !name.trim() ? "#b0c8ef" : "var(--color-primary)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: "0.9375rem",
                fontWeight: 500,
                cursor: loading || !name.trim() ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "作成中..." : "授業を作成する"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

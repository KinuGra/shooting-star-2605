"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinClassPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) { setError("招待コードを入力してください"); return; }
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 700));
    const upper = code.trim().toUpperCase();
    if (upper === "DS2024A") { router.push("/student/classes/cls-1"); return; }
    if (upper === "WEB2024B") { router.push("/student/classes/cls-2"); return; }
    setError("招待コードが正しくありません。");
    setLoading(false);
  }

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
          style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", textDecoration: "none", display: "inline-block", marginBottom: 24 }}
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
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 8, letterSpacing: "-0.02em" }}>
            授業に参加する
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: 28, lineHeight: 1.6 }}>
            教員から共有された招待コードを入力してください。
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="code"
                style={{ display: "block", fontSize: "0.8125rem", fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 }}
              >
                招待コード
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="例: DS2024A"
                autoComplete="off"
                spellCheck={false}
                style={{
                  width: "100%",
                  border: error ? "1.5px solid var(--color-danger)" : "1.5px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: "0.9375rem",
                  fontFamily: "var(--font-geist-mono, monospace)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-text-primary)",
                  background: "var(--color-bg)",
                  outline: "none",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.background = "#fff"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = error ? "var(--color-danger)" : "var(--color-border)"; }}
              />
              {error && (
                <p style={{ marginTop: 6, fontSize: "0.75rem", color: "var(--color-danger)" }}>{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: loading ? "#6c9dd6" : "var(--color-primary)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: "0.9375rem",
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "-0.01em",
              }}
            >
              {loading ? "参加中..." : "授業に参加する"}
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: "0.75rem", color: "var(--color-text-muted)", textAlign: "center" }}>
            ヒント: DS2024A または WEB2024B
          </p>
        </div>
      </div>
    </div>
  );
}

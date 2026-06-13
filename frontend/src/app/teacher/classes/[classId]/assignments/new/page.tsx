"use client";

import Link from "next/link";
import { useState, use } from "react";
import { useRouter } from "next/navigation";

const LANGUAGES = ["Python", "Java", "C++", "C", "JavaScript", "Go", "Rust"];

interface Props { params: Promise<{ classId: string }> }

export default function NewAssignmentPage({ params }: Props) {
  const { classId } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("Python");
  const [maxScore, setMaxScore] = useState(10);
  const [deadline, setDeadline] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [testCases, setTestCases] = useState([{ input: "", expectedOutput: "" }]);
  const [loading, setLoading] = useState(false);

  function addTestCase() { setTestCases((p) => [...p, { input: "", expectedOutput: "" }]); }
  function updateTC(i: number, f: "input" | "expectedOutput", v: string) {
    setTestCases((p) => p.map((tc, j) => j === i ? { ...tc, [f]: v } : tc));
  }
  function removeTC(i: number) { setTestCases((p) => p.filter((_, j) => j !== i)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !deadline) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    router.push(`/teacher/classes/${classId}`);
  }

  const inputStyle = {
    width: "100%",
    border: "1.5px solid var(--color-border)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: "0.9375rem",
    color: "var(--color-text-primary)",
    background: "var(--color-bg)",
    outline: "none",
  };

  const labelStyle = {
    display: "block" as const,
    fontSize: "0.8125rem",
    fontWeight: 500 as const,
    color: "var(--color-text-primary)",
    marginBottom: 6,
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
        <Link href="/teacher" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>ダッシュボード</Link>
        <span>›</span>
        <Link href={`/teacher/classes/${classId}`} style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>授業管理</Link>
        <span>›</span>
        <span style={{ color: "var(--color-text-primary)" }}>課題を作成</span>
      </div>

      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.02em", marginBottom: 32 }}>
        課題を作成
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Basic info */}
        <section
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            padding: "24px",
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 20 }}>基本情報</h2>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>課題名 <span style={{ color: "var(--color-danger)" }}>*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 二分探索アルゴリズムの実装"
              required
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.background = "#fff"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>課題の内容</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={"Markdown 形式で記述できます。\n\n## 問題\n...\n\n## 入力形式\n..."}
              rows={8}
              style={{ ...inputStyle, fontFamily: "var(--font-geist-mono, monospace)", fontSize: "0.8125rem", resize: "vertical" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.background = "#fff"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>言語</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ ...inputStyle, width: "100%" }}
              >
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>満点</label>
              <input
                type="number"
                min={1}
                max={100}
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.background = "#fff"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
              />
            </div>
            <div>
              <label style={labelStyle}>提出期限 <span style={{ color: "var(--color-danger)" }}>*</span></label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.background = "#fff"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; }}
              />
            </div>
          </div>

          {/* Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              style={{
                position: "relative",
                width: 42,
                height: 24,
                borderRadius: 12,
                border: "none",
                background: isPublic ? "var(--color-primary)" : "var(--color-border)",
                cursor: "pointer",
                transition: "background 0.2s",
                padding: 0,
              }}
              role="switch"
              aria-checked={isPublic}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: isPublic ? 21 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            </button>
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-primary)" }}>
              学生に公開する
            </span>
            {!isPublic && (
              <span
                style={{
                  fontSize: "0.6875rem",
                  background: "var(--color-warning-surface)",
                  color: "var(--color-warning)",
                  border: "1px solid #fcd68a",
                  borderRadius: 4,
                  padding: "2px 8px",
                  fontWeight: 500,
                }}
              >
                非公開
              </span>
            )}
          </div>
        </section>

        {/* Test cases */}
        <section
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            padding: "24px",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)" }}>テストケース</h2>
            <button
              type="button"
              onClick={addTestCase}
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-primary)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
                padding: 0,
              }}
            >
              + 追加
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {testCases.map((tc, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 16px",
                    background: "var(--color-bg)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--color-text-muted)" }}>ケース {idx + 1}</span>
                  {testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTC(idx)}
                      style={{ fontSize: "0.75rem", color: "var(--color-danger)", background: "none", border: "none", cursor: "pointer" }}
                    >
                      削除
                    </button>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                  <div style={{ padding: 12, borderRight: "1px solid var(--color-border)" }}>
                    <label style={{ ...labelStyle, fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>入力</label>
                    <textarea
                      value={tc.input}
                      onChange={(e) => updateTC(idx, "input", e.target.value)}
                      rows={3}
                      placeholder="標準入力"
                      className="code-editor"
                      style={{ width: "100%", border: "none", resize: "none", outline: "none", background: "transparent", color: "var(--color-text-primary)" }}
                    />
                  </div>
                  <div style={{ padding: 12 }}>
                    <label style={{ ...labelStyle, fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>期待される出力</label>
                    <textarea
                      value={tc.expectedOutput}
                      onChange={(e) => updateTC(idx, "expectedOutput", e.target.value)}
                      rows={3}
                      placeholder="期待する出力"
                      className="code-editor"
                      style={{ width: "100%", border: "none", resize: "none", outline: "none", background: "transparent", color: "var(--color-text-primary)" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Submit */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            type="submit"
            disabled={loading || !title.trim() || !deadline}
            style={{
              padding: "10px 24px",
              background: loading || !title.trim() || !deadline ? "#b0c8ef" : "var(--color-primary)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: "0.9375rem",
              fontWeight: 500,
              cursor: loading || !title.trim() || !deadline ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "作成中..." : "課題を作成する"}
          </button>
          <Link
            href={`/teacher/classes/${classId}`}
            style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", textDecoration: "none" }}
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}

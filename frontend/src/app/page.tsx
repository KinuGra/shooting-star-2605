import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShootingStar — プログラミング課題採点プラットフォーム",
};

const features = [
  {
    title: "即時自動採点",
    description: "コードを提出するとジャッジサーバーが即座に評価。",
  },
  {
    title: "成績の一元管理",
    description:
      "授業ごとの提出状況・得点をダッシュボードで把握。教員も学生も進捗をリアルタイムに確認できます。",
  },
  {
    title: "教員によるフィードバック",
    description:
      "自動採点後に教員・TAがスコア修正とコメントを追加。テストケースごとの実行結果も表示します。",
  },
];

const steps = [
  {
    index: "1",
    actor: "教員",
    title: "授業・課題の作成",
    body: "授業を作成して招待コードを発行。課題の内容・テストケース・期限を設定します。",
  },
  {
    index: "2",
    actor: "学生",
    title: "コードの提出",
    body: "招待コードで授業に参加し、ブラウザ上のエディタからコードを提出します。",
  },
  {
    index: "3",
    actor: "システム",
    title: "自動採点とレビュー",
    body: "ジャッジサーバーが即時採点し、教員はコメントで学習をサポートします。",
  },
];

export default function LandingPage() {
  return (
    <div
      style={{
        fontFamily:
          "var(--font-geist-sans, -apple-system, 'Helvetica Neue', sans-serif)",
        background: "#fff",
        color: "#1d1d1f",
        minHeight: "100vh",
      }}
    >
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid #d2d2d7",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "saturate(180%) blur(20px)",
        }}
      >
        <div
          style={{
            maxWidth: 980,
            margin: "0 auto",
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
          }}
        >
          <span
            style={{
              fontSize: "0.9375rem",
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            ShootingStar
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              href="/student"
              style={{
                fontSize: "0.8125rem",
                color: "#1d1d1f",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: 980,
                border: "1px solid #d2d2d7",
                fontWeight: 400,
              }}
            >
              学生
            </Link>
            <Link
              href="/teacher"
              style={{
                fontSize: "0.8125rem",
                color: "#fff",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: 980,
                background: "#0071e3",
                fontWeight: 400,
              }}
            >
              教員
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section
        style={{
          textAlign: "center",
          padding: "120px 24px 80px",
          maxWidth: 680,
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontSize: "0.8125rem",
            color: "#6e6e73",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          大学プログラミング授業向け
        </p>
        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#1d1d1f",
            marginBottom: 24,
          }}
        >
          採点業務を、
          <br />
          根本から変える。
        </h1>
        <p
          style={{
            fontSize: "1.0625rem",
            color: "#6e6e73",
            lineHeight: 1.7,
            marginBottom: 40,
            fontWeight: 400,
          }}
        >
          学生がコードを提出するだけで即時採点。
          <br />
          教員・TAの手作業を自動化し、教育の本質に集中できます。
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/student"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "14px 28px",
              background: "#0071e3",
              color: "#fff",
              borderRadius: 980,
              fontSize: "0.9375rem",
              fontWeight: 500,
              textDecoration: "none",
              letterSpacing: "-0.01em",
            }}
          >
            学生として始める
          </Link>
          <Link
            href="/teacher"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "14px 28px",
              background: "transparent",
              color: "#0071e3",
              borderRadius: 980,
              border: "1px solid #d2d2d7",
              fontSize: "0.9375rem",
              fontWeight: 500,
              textDecoration: "none",
              letterSpacing: "-0.01em",
            }}
          >
            教員としてログイン
          </Link>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section
        style={{
          borderTop: "1px solid #d2d2d7",
          background: "#f5f5f7",
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "1.875rem",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "#1d1d1f",
              textAlign: "center",
              marginBottom: 56,
            }}
          >
            なぜ ShootingStar か
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 1,
              background: "#d2d2d7",
              border: "1px solid #d2d2d7",
              borderRadius: 18,
              overflow: "hidden",
            }}
          >
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  background: "#f5f5f7",
                  padding: "40px 32px",
                }}
              >
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#1d1d1f",
                    marginBottom: 10,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#6e6e73",
                    lineHeight: 1.7,
                  }}
                >
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section
        style={{ padding: "80px 24px", maxWidth: 980, margin: "0 auto" }}
      >
        <h2
          style={{
            fontSize: "1.875rem",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "#1d1d1f",
            textAlign: "center",
            marginBottom: 56,
          }}
        >
          3 ステップで完結
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
          }}
        >
          {steps.map((s) => (
            <div key={s.index} style={{ display: "flex", gap: 16 }}>
              <div
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "1.5px solid #d2d2d7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#6e6e73",
                  marginTop: 2,
                }}
              >
                {s.index}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.6875rem",
                    color: "#0071e3",
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  {s.actor}
                </p>
                <h3
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "#1d1d1f",
                    marginBottom: 6,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#6e6e73",
                    lineHeight: 1.6,
                  }}
                >
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section
        style={{
          borderTop: "1px solid #d2d2d7",
          padding: "80px 24px",
          textAlign: "center",
          background: "#f5f5f7",
        }}
      >
        <h2
          style={{
            fontSize: "1.875rem",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "#1d1d1f",
            marginBottom: 16,
          }}
        >
          今すぐ始めましょう
        </h2>
        <p
          style={{ fontSize: "0.9375rem", color: "#6e6e73", marginBottom: 32 }}
        >
          学生・教員それぞれのダッシュボードにアクセスできます。
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/student"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "14px 28px",
              background: "#0071e3",
              color: "#fff",
              borderRadius: 980,
              fontSize: "0.9375rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            学生ダッシュボードへ
          </Link>
          <Link
            href="/teacher"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "14px 28px",
              color: "#0071e3",
              borderRadius: 980,
              border: "1px solid #d2d2d7",
              background: "#fff",
              fontSize: "0.9375rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            教員ダッシュボードへ
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid #d2d2d7",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "0.75rem", color: "#6e6e73" }}>
          Copyright &copy; 2025 ShootingStar. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

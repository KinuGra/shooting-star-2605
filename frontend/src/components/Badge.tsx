import type { JudgeStatus } from "@/lib/types";

const judgeConfig: Record<
  JudgeStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  AC: {
    label: "AC",
    bg: "var(--color-success-surface)",
    text: "var(--color-success)",
    border: "#a8d5b5",
  },
  WA: {
    label: "WA",
    bg: "var(--color-danger-surface)",
    text: "var(--color-danger)",
    border: "#f5c6c4",
  },
  TLE: {
    label: "TLE",
    bg: "var(--color-warning-surface)",
    text: "var(--color-warning)",
    border: "#fcd68a",
  },
  CE: { label: "CE", bg: "#f3e8fd", text: "#6b21a8", border: "#d8b4fe" },
  RE: { label: "RE", bg: "#fff7ed", text: "#9a3412", border: "#fdba74" },
  MLE: { label: "MLE", bg: "#ecfeff", text: "#155e75", border: "#a5f3fc" },
  pending: {
    label: "待機中",
    bg: "var(--color-neutral-surface)",
    text: "var(--color-neutral)",
    border: "var(--color-border)",
  },
  running: {
    label: "採点中",
    bg: "var(--color-primary-subtle)",
    text: "var(--color-primary)",
    border: "var(--color-primary-surface)",
  },
};

interface JudgeBadgeProps {
  status: JudgeStatus;
  size?: "sm" | "md" | "lg";
}

export function JudgeBadge({ status, size = "md" }: JudgeBadgeProps) {
  const c = judgeConfig[status];
  const px = size === "sm" ? "6px" : size === "lg" ? "10px" : "8px";
  const py = size === "sm" ? "1px" : size === "lg" ? "3px" : "2px";
  const fs = size === "lg" ? "0.8125rem" : "0.6875rem";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        borderRadius: "4px",
        padding: `${py} ${px}`,
        fontSize: fs,
        fontFamily: "var(--font-geist-mono, monospace)",
        fontWeight: 500,
        letterSpacing: "0.02em",
        lineHeight: 1.4,
      }}
    >
      {status === "running" && (
        <span
          style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: c.text,
            animation: "pulse 1.5s infinite",
          }}
        />
      )}
      {c.label}
    </span>
  );
}

interface StatusBadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

export function StatusBadge({ label, variant = "default" }: StatusBadgeProps) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    default: {
      bg: "var(--color-neutral-surface)",
      text: "var(--color-neutral)",
      border: "var(--color-border)",
    },
    success: {
      bg: "var(--color-success-surface)",
      text: "var(--color-success)",
      border: "#a8d5b5",
    },
    warning: {
      bg: "var(--color-warning-surface)",
      text: "var(--color-warning)",
      border: "#fcd68a",
    },
    danger: {
      bg: "var(--color-danger-surface)",
      text: "var(--color-danger)",
      border: "#f5c6c4",
    },
    info: {
      bg: "var(--color-primary-subtle)",
      text: "var(--color-primary)",
      border: "var(--color-primary-surface)",
    },
  };
  const s = styles[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        borderRadius: "4px",
        padding: "2px 8px",
        fontSize: "0.6875rem",
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );
}

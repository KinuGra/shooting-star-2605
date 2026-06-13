interface ScoreBarProps {
  score: number;
  max: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ScoreBar({
  score,
  max,
  showLabel = true,
  size = "md",
}: ScoreBarProps) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const color =
    pct >= 80
      ? "var(--color-success)"
      : pct >= 60
        ? "#b45309"
        : "var(--color-danger)";

  const h = size === "sm" ? 3 : 4;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {showLabel && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--color-text-primary)",
            }}
          >
            {score}
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 400,
                color: "var(--color-text-muted)",
              }}
            >
              /{max}
            </span>
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
            }}
          >
            {pct}%
          </span>
        </div>
      )}
      <div
        style={{
          width: "100%",
          height: h,
          background: "var(--color-border)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 2,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

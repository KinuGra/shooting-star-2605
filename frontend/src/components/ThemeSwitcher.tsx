"use client";

import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { THEMES, THEME_LABELS, type Theme } from "@/lib/themes";

const THEME_EMOJI: Record<Theme, string> = {
  default: "🎨",
  kawaii: "🌸",
  kakkoii: "🌙",
  kibatsu: "🌈",
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="テーマ切替"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "5px 10px",
          border: "1px solid var(--color-border)",
          borderRadius: 6,
          background: "var(--color-surface)",
          color: "var(--color-text-secondary)",
          fontSize: "0.8125rem",
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        <span>{THEME_EMOJI[theme]}</span>
        <span style={{ fontSize: "0.75rem" }}>{THEME_LABELS[theme]}</span>
      </button>

      {open && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
            }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              zIndex: 50,
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 8,
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              minWidth: 160,
              overflow: "hidden",
            }}
          >
            {THEMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTheme(t);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "10px 14px",
                  border: "none",
                  background:
                    theme === t
                      ? "var(--color-primary-subtle)"
                      : "transparent",
                  color:
                    theme === t
                      ? "var(--color-primary)"
                      : "var(--color-text-primary)",
                  fontSize: "0.875rem",
                  fontWeight: theme === t ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: "1rem" }}>{THEME_EMOJI[t]}</span>
                {THEME_LABELS[t]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

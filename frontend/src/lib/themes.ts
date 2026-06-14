export const THEMES = ["default", "kawaii", "kakkoii", "kibatsu"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_LABELS: Record<Theme, string> = {
  default: "デフォルト",
  kawaii: "パステルピンク",
  kakkoii: "ダーク",
  kibatsu: "ネオン",
};

export const THEME_STORAGE_KEY = "shootingstar-theme";

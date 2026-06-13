const COOKIE_NAME = "auth-token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function setAuthToken(token: string): void {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; SameSite=Strict; Max-Age=${MAX_AGE}`;
}

export function clearAuthToken(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; Max-Age=0`;
}

export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

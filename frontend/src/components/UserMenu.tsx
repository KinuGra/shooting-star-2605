"use client";

import { useMe } from "@/api/generated/auth/auth";
import { clearAuthToken } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { data } = useMe();
  const router = useRouter();

  const handleSignOut = () => {
    clearAuthToken();
    router.push("/auth/login");
  };

  if (!data?.data) return null;

  const user = data.data;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{
          fontSize: "0.8125rem",
          color: "var(--color-text-secondary)",
        }}
      >
        {user.name ?? user.email}
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        style={{
          fontSize: "0.8125rem",
          color: "var(--color-text-muted)",
          background: "none",
          border: "1px solid var(--color-border)",
          borderRadius: 6,
          padding: "4px 10px",
          cursor: "pointer",
        }}
      >
        ログアウト
      </button>
    </div>
  );
}

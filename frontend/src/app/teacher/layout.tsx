"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { UserMenu } from "@/components/UserMenu";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useMe } from "@/api/generated/auth/auth";
import { getAuthToken } from "@/lib/auth-client";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data, isLoading } = useMe({ swr: { enabled: !!getAuthToken() } });

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace("/auth/login");
      return;
    }
    if (!isLoading && data) {
      const role = data.data?.role;
      if (role !== "TEACHER" && role !== "ADMIN") {
        router.replace("/student");
      }
    }
  }, [isLoading, data, router]);

  if (!getAuthToken() || isLoading || !data) {
    return null;
  }

  const role = data.data?.role;
  if (role !== "TEACHER" && role !== "ADMIN") {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar
        role="teacher"
        rightSlot={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ThemeSwitcher />
            <Link
              href="/teacher/classes/new"
              style={{
                fontSize: "0.8125rem",
                color: "#fff",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: 6,
                background: "var(--color-primary)",
                fontWeight: 500,
              }}
            >
              + 授業を作成
            </Link>
            <UserMenu />
          </div>
        }
      />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}

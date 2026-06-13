import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { UserMenu } from "@/components/UserMenu";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { UserMenu } from "@/components/UserMenu";

export default function StudentLayout({
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
        role="student"
        rightSlot={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              href="/student/classes/join"
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-primary)",
                textDecoration: "none",
                padding: "6px 14px",
                borderRadius: 6,
                border: "1px solid var(--color-primary-surface)",
                background: "var(--color-primary-subtle)",
                fontWeight: 500,
              }}
            >
              授業に参加
            </Link>
            <UserMenu />
          </div>
        }
      />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}

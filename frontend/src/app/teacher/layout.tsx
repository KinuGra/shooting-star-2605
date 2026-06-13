import { Navbar } from "@/components/Navbar";
import Link from "next/link";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <Navbar
        role="teacher"
        userName="田中 誠"
        rightSlot={
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
        }
      />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}

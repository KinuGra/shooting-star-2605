import Link from "next/link";

interface NavbarProps {
  role?: "student" | "teacher";
  userName?: string;
  rightSlot?: React.ReactNode;
}

export function Navbar({ role, userName, rightSlot }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link
            href={
              role === "teacher"
                ? "/teacher"
                : role === "student"
                  ? "/student"
                  : "/"
            }
            className="text-[var(--color-text-primary)] text-sm font-medium tracking-tight hover:opacity-80"
          >
            ShootingStar
          </Link>
          {role && (
            <>
              <span className="text-[var(--color-border)]">/</span>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {role === "teacher" ? "教員" : "学生"}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {rightSlot}
          {userName && (
            <div className="ml-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-medium text-white">
                {userName.charAt(0)}
              </div>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {userName}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

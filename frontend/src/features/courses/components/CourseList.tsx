"use client";

import Link from "next/link";
import { useGetMyCourses } from "@/api/generated/courses/courses";
import type { CourseResponse } from "@/api/model";

function CourseCard({
  course,
  href,
}: {
  course: CourseResponse;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="row-link"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "18px 24px",
        textDecoration: "none",
        borderBottom: "1px solid var(--color-divider)",
        background: "var(--color-surface)",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: 8,
          background: "var(--color-primary-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.875rem",
          fontWeight: 700,
          color: "var(--color-primary)",
        }}
      >
        {(course.name ?? "?").charAt(0)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "0.9375rem",
            fontWeight: 500,
            color: "var(--color-text-primary)",
            marginBottom: 2,
          }}
        >
          {course.name}
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
          {course.ownerName}
        </p>
      </div>
      <span
        style={{
          color: "var(--color-text-muted)",
          fontSize: "0.875rem",
          flexShrink: 0,
        }}
      >
        ›
      </span>
    </Link>
  );
}

export function StudentCourseList() {
  const { data, isLoading, error } = useGetMyCourses();

  if (isLoading) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--color-text-muted)",
          fontSize: "0.875rem",
        }}
      >
        読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--color-danger)",
          fontSize: "0.875rem",
        }}
      >
        授業の読み込みに失敗しました。
      </div>
    );
  }

  const courses = (data?.data as CourseResponse[]) ?? [];

  if (courses.length === 0) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--color-text-muted)",
          fontSize: "0.875rem",
        }}
      >
        参加している授業がありません。招待コードを入力して参加しましょう。
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--color-surface)",
      }}
    >
      {courses.map((course, idx) => (
        <div
          key={course.id}
          style={{
            borderBottom:
              idx < courses.length - 1
                ? "1px solid var(--color-divider)"
                : "none",
          }}
        >
          <CourseCard course={course} href={`/student/classes/${course.id}`} />
        </div>
      ))}
    </div>
  );
}

export function TeacherCourseList() {
  const { data, isLoading, error } = useGetMyCourses();

  if (isLoading) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--color-text-muted)",
          fontSize: "0.875rem",
        }}
      >
        読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--color-danger)",
          fontSize: "0.875rem",
        }}
      >
        授業の読み込みに失敗しました。
      </div>
    );
  }

  const courses = (data?.data as CourseResponse[]) ?? [];

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {courses.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
          }}
        >
          まだ授業がありません。
        </div>
      ) : (
        courses.map((cls, idx) => (
          <div
            key={cls.id}
            style={{
              padding: "20px 24px",
              borderBottom:
                idx < courses.length - 1
                  ? "1px solid var(--color-divider)"
                  : "none",
              display: "flex",
              alignItems: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                flex: 1,
                minWidth: 200,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: "var(--color-primary-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  flexShrink: 0,
                }}
              >
                {(cls.name ?? "?").charAt(0)}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    color: "var(--color-text-primary)",
                    marginBottom: 2,
                  }}
                >
                  {cls.name}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {cls.inviteCode && (
                    <span
                      style={{
                        fontFamily: "var(--font-geist-mono, monospace)",
                      }}
                    >
                      招待コード: {cls.inviteCode}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <Link
                href={`/teacher/classes/${cls.id}/assignments/new`}
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-text-secondary)",
                  textDecoration: "none",
                  padding: "6px 12px",
                  border: "1px solid var(--color-border)",
                  borderRadius: 6,
                  background: "var(--color-bg)",
                  fontWeight: 500,
                }}
              >
                + 課題
              </Link>
              <Link
                href={`/teacher/classes/${cls.id}`}
                style={{
                  fontSize: "0.8125rem",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: 6,
                  background: "var(--color-primary)",
                  fontWeight: 500,
                }}
              >
                管理する
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

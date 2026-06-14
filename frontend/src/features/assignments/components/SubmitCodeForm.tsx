"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { z } from "zod";
import {
  useSubmit,
  useGetSubmissions,
} from "@/api/generated/submissions/submissions";
import type { AssignmentResponse, SubmissionResponse, JudgeResultResponse } from "@/api/model";
import { JudgeBadge } from "@/components/Badge";
import type { JudgeStatus } from "@/lib/types";

const STATUS_PRIORITY: JudgeStatus[] = ["WA", "RE", "CE", "TLE", "MLE", "AC"];
function overallStatus(results: JudgeResultResponse[] | undefined): JudgeStatus {
  if (!results || results.length === 0) return "pending";
  for (const s of STATUS_PRIORITY) {
    if (results.some((r) => r.status === s)) return s;
  }
  return "AC";
}

const submitSchema = z.object({
  codeContent: z.string().min(1, "コードを入力してください"),
  language: z.string().min(1),
});

type SubmitFormData = z.infer<typeof submitSchema>;

const LANGUAGES = ["Python", "JavaScript", "C", "C++", "Java"];

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

interface Props {
  assignment: AssignmentResponse;
  courseId: string;
}

export function SubmitCodeForm({ assignment, courseId }: Props) {
  const { trigger, isMutating } = useSubmit(assignment.id ?? "");
  const { data: submissionsData, mutate } = useGetSubmissions(
    assignment.id ?? "",
  );
  const [lastResult, setLastResult] = useState<SubmissionResponse | null>(null);

  const isPast = assignment.deadlineAt
    ? new Date(assignment.deadlineAt) < new Date()
    : false;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      language: (assignment.languages ?? [])[0] ?? "Python",
    },
  });

  const onSubmit = async (data: SubmitFormData) => {
    try {
      const result = await trigger({
        codeContent: data.codeContent,
        language: data.language,
      });
      setLastResult(
        (result as unknown as { data: SubmissionResponse }).data ?? null,
      );
      mutate();
    } catch {
      // ignore — error shown via SWR
    }
  };

  const submissions = (submissionsData?.data as SubmissionResponse[]) ?? [];

  const availableLanguages =
    (assignment.languages ?? []).length > 0 ? assignment.languages! : LANGUAGES;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <div
        style={{
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          padding: "0 24px",
          height: 48,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.8125rem",
            color: "var(--color-text-secondary)",
          }}
        >
          <Link
            href="/student"
            style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
          >
            マイ授業
          </Link>
          <span>›</span>
          <Link
            href={`/student/classes/${courseId}`}
            style={{ color: "var(--color-text-muted)", textDecoration: "none" }}
          >
            授業
          </Link>
          <span>›</span>
          <span style={{ color: "var(--color-text-primary)" }}>
            {assignment.title}
          </span>
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              color: isPast ? "var(--color-danger)" : "var(--color-text-muted)",
            }}
          >
            期限:{" "}
            {assignment.deadlineAt
              ? new Intl.DateTimeFormat("ja-JP", {
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(assignment.deadlineAt))
              : "—"}
            {isPast ? " (締切)" : ""}
          </span>
          <span
            style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}
          >
            {assignment.maxScore ?? "—"}点満点
          </span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div
          style={{
            width: 380,
            flexShrink: 0,
            borderRight: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            overflowY: "auto",
            padding: "24px",
          }}
        >
          <h1
            style={{
              fontSize: "1.0625rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: 16,
              letterSpacing: "-0.01em",
            }}
          >
            {assignment.title}
          </h1>
          <div
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
            }}
          >
            {assignment.description ?? "説明なし"}
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <div
            style={{
              height: 40,
              borderBottom: "1px solid var(--color-border)",
              background: "var(--color-bg)",
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              gap: 12,
            }}
          >
            <label
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                fontWeight: 500,
              }}
            >
              言語
            </label>
            <select
              {...register("language")}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: "0.8125rem",
                color: "var(--color-text-primary)",
                background: "var(--color-surface)",
                outline: "none",
              }}
            >
              {availableLanguages.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <div style={{ marginLeft: "auto" }}>
              <button
                type="submit"
                disabled={isMutating || isPast}
                style={{
                  padding: "5px 16px",
                  background:
                    isMutating || isPast ? "#ccc" : "var(--color-primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  cursor: isMutating || isPast ? "not-allowed" : "pointer",
                }}
              >
                {isMutating ? "採点中..." : "提出する"}
              </button>
            </div>
          </div>

          <div style={{ flex: 1, background: "#1e1e1e", overflow: "hidden" }}>
            <textarea
              {...register("codeContent")}
              spellCheck={false}
              autoComplete="off"
              className="code-editor"
              placeholder="# ここにコードを入力してください"
              style={{
                width: "100%",
                height: "100%",
                background: "transparent",
                color: "#d4d4d4",
                border: "none",
                outline: "none",
                resize: "none",
                padding: "20px",
                caretColor: "#aeafad",
                fontFamily: "var(--font-geist-mono, monospace)",
                fontSize: "0.875rem",
              }}
            />
          </div>

          {errors.codeContent && (
            <div
              style={{
                borderTop: "1px solid var(--color-danger)",
                background: "var(--color-bg)",
                padding: "8px 20px",
                fontSize: "0.8125rem",
                color: "var(--color-danger)",
              }}
            >
              {errors.codeContent.message}
            </div>
          )}

          {lastResult && (
            <div
              style={{
                borderTop: "1px solid var(--color-border)",
                background: "var(--color-bg)",
                padding: "16px 20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-success)",
                  }}
                >
                  提出完了
                </span>
                <span
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  スコア: {lastResult.score ?? "採点中..."}/
                  {assignment.maxScore ?? "—"} 点
                </span>
              </div>
            </div>
          )}
        </form>
      </div>

      {submissions.length > 0 && (
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <div style={{ padding: "12px 24px 8px", display: "flex", alignItems: "center", gap: 8 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              提出履歴
            </p>
            <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", background: "var(--color-neutral-surface)", borderRadius: 10, padding: "1px 7px" }}>
              {submissions.length}件
            </span>
          </div>
          <div style={{ borderTop: "1px solid var(--color-divider)" }}>
            {submissions.map((sub, idx) => (
              <Link
                key={sub.id}
                href={`/student/classes/${courseId}/assignments/${assignment.id}/submissions/${sub.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px auto 1fr auto",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 24px",
                  borderBottom: idx < submissions.length - 1 ? "1px solid var(--color-divider)" : "none",
                  textDecoration: "none",
                  background: "transparent",
                  transition: "background 0.1s",
                }}
                className="card-link"
              >
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontVariantNumeric: "tabular-nums" }}>
                  #{submissions.length - idx}
                </span>
                <JudgeBadge status={overallStatus(sub.judgeResults)} size="sm" />
                <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                  {fmtDate(sub.submittedAt ?? "")}
                </span>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums" }}>
                  {sub.score ?? "—"}<span style={{ fontWeight: 400, color: "var(--color-text-muted)", fontSize: "0.75rem" }}>/{assignment.maxScore ?? "—"}点</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  useUpdateAssignment,
  useGetTestCases,
  createTestCase,
  updateTestCase,
  deleteTestCase,
} from "@/api/generated/assignments/assignments";
import type { AssignmentResponse, TestCaseResponse } from "@/api/model";

const LANGUAGES = ["Python", "JavaScript", "C", "C++", "Java"];

const editSchema = z.object({
  title: z.string().min(1, "課題名を入力してください"),
  description: z.string().optional(),
  isPublished: z.boolean(),
  deadlineAt: z.string().min(1, "提出期限を設定してください"),
  maxScore: z.number().min(0).optional(),
  languages: z.array(z.string()),
});

type EditFormData = z.infer<typeof editSchema>;

type TcEdit = {
  id?: string;
  input: string;
  expectedOutput: string;
  score: number;
};

const inputStyle = {
  width: "100%",
  border: "1.5px solid var(--color-border)",
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: "0.9375rem",
  color: "var(--color-text-primary)",
  background: "var(--color-bg)",
  outline: "none",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "block" as const,
  fontSize: "0.8125rem",
  fontWeight: 500 as const,
  color: "var(--color-text-primary)",
  marginBottom: 6,
};

function toLocalDatetime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Props {
  assignment: AssignmentResponse;
  courseId: string;
}

export function EditAssignmentForm({ assignment, courseId }: Props) {
  const router = useRouter();
  const { trigger, isMutating } = useUpdateAssignment(assignment.id ?? "");
  const { data: tcData } = useGetTestCases(assignment.id ?? "");

  const [testCases, setTestCases] = useState<TcEdit[]>([]);
  const [originalIds, setOriginalIds] = useState<string[]>([]);
  const [tcInitialized, setTcInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  useEffect(() => {
    if (tcData?.data && !tcInitialized) {
      const sorted = [...(tcData.data as TestCaseResponse[])].sort(
        (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
      );
      setTestCases(
        sorted.map((tc) => ({
          id: tc.id,
          input: tc.input ?? "",
          expectedOutput: tc.expectedOutput ?? "",
          score: tc.score ?? 0,
        })),
      );
      setOriginalIds(sorted.map((tc) => tc.id ?? "").filter(Boolean));
      setTcInitialized(true);
    }
  }, [tcData, tcInitialized]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: assignment.title ?? "",
      description: assignment.description ?? "",
      isPublished: assignment.isPublished ?? false,
      deadlineAt: assignment.deadlineAt
        ? toLocalDatetime(assignment.deadlineAt)
        : "",
      maxScore: assignment.maxScore ?? undefined,
      languages: assignment.languages ?? [],
    },
  });

  const isPublished = watch("isPublished");

  const addTestCase = () => {
    setTestCases((prev) => [
      ...prev,
      { input: "", expectedOutput: "", score: 10 },
    ]);
  };

  const removeTestCase = (idx: number) => {
    setTestCases((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateTc = (
    idx: number,
    field: keyof Omit<TcEdit, "id">,
    value: string | number,
  ) => {
    setTestCases((prev) =>
      prev.map((tc, i) => (i === idx ? { ...tc, [field]: value } : tc)),
    );
  };

  const onSubmit = async (data: EditFormData) => {
    setSaving(true);
    setRootError(null);
    try {
      await trigger({
        title: data.title,
        description: data.description,
        isPublished: data.isPublished,
        deadlineAt: new Date(data.deadlineAt).toISOString(),
        maxScore: data.maxScore,
        languages: data.languages,
      });

      const currentIds = testCases
        .filter((tc) => tc.id)
        .map((tc) => tc.id as string);
      const deletedIds = originalIds.filter((id) => !currentIds.includes(id));

      for (const id of deletedIds) {
        await deleteTestCase(id);
      }

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        if (tc.id) {
          await updateTestCase(tc.id, {
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            score: tc.score,
            orderIndex: i,
          });
        } else {
          await createTestCase(assignment.id ?? "", {
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            score: tc.score,
            orderIndex: i,
          });
        }
      }

      router.push(
        `/teacher/classes/${courseId}/assignments/${assignment.id}/submissions`,
      );
      router.refresh();
    } catch {
      setRootError("課題の更新に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  const isBusy = isMutating || saving;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 基本情報 */}
      <section
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: "24px",
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontSize: "0.9375rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            marginBottom: 20,
          }}
        >
          基本情報
        </h2>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>
            課題名 <span style={{ color: "var(--color-danger)" }}>*</span>
          </label>
          <input
            {...register("title")}
            type="text"
            style={{
              ...inputStyle,
              borderColor: errors.title
                ? "var(--color-danger)"
                : "var(--color-border)",
            }}
          />
          {errors.title && (
            <p
              style={{
                marginTop: 4,
                fontSize: "0.75rem",
                color: "var(--color-danger)",
              }}
            >
              {errors.title.message}
            </p>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>課題の内容</label>
          <textarea
            {...register("description")}
            rows={8}
            style={{
              ...inputStyle,
              fontFamily: "var(--font-geist-mono, monospace)",
              fontSize: "0.8125rem",
              resize: "vertical",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div>
            <label style={labelStyle}>
              提出期限 <span style={{ color: "var(--color-danger)" }}>*</span>
            </label>
            <input
              {...register("deadlineAt")}
              type="datetime-local"
              style={{
                ...inputStyle,
                borderColor: errors.deadlineAt
                  ? "var(--color-danger)"
                  : "var(--color-border)",
              }}
            />
            {errors.deadlineAt && (
              <p
                style={{
                  marginTop: 4,
                  fontSize: "0.75rem",
                  color: "var(--color-danger)",
                }}
              >
                {errors.deadlineAt.message}
              </p>
            )}
          </div>
          <div>
            <label style={labelStyle}>満点（任意）</label>
            <input
              {...register("maxScore", { valueAsNumber: true })}
              type="number"
              min={0}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>言語</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {LANGUAGES.map((lang) => {
                const { onChange, ...rest } = register("languages");
                return (
                  <label
                    key={lang}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "0.8125rem",
                      color: "var(--color-text-primary)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      value={lang}
                      {...rest}
                      onChange={onChange}
                    />
                    {lang}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            {...register("isPublished")}
            type="checkbox"
            id="isPublished"
            style={{ width: 16, height: 16, cursor: "pointer" }}
          />
          <label
            htmlFor="isPublished"
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-primary)",
              cursor: "pointer",
            }}
          >
            学生に公開する
          </label>
          {!isPublished && (
            <span
              style={{
                fontSize: "0.6875rem",
                background: "var(--color-warning-surface)",
                color: "var(--color-warning)",
                border: "1px solid #fcd68a",
                borderRadius: 4,
                padding: "2px 8px",
                fontWeight: 500,
              }}
            >
              非公開
            </span>
          )}
        </div>
      </section>

      {/* テストケース */}
      <section
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          padding: "24px",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            テストケース
            <span
              style={{
                marginLeft: 8,
                fontSize: "0.75rem",
                fontWeight: 400,
                color: "var(--color-text-muted)",
              }}
            >
              {testCases.length}件
            </span>
          </h2>
          <button
            type="button"
            onClick={addTestCase}
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-primary)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 500,
              padding: 0,
            }}
          >
            + 追加
          </button>
        </div>

        {!tcInitialized ? (
          <p
            style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}
          >
            読み込み中...
          </p>
        ) : testCases.length === 0 ? (
          <p
            style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}
          >
            テストケースがありません。「+ 追加」で追加してください。
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {testCases.map((tc, idx) => (
              <div
                key={tc.id ?? `new-${idx}`}
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 16px",
                    background: "var(--color-bg)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    ケース {idx + 1}
                    {!tc.id && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: "0.6875rem",
                          color: "var(--color-primary)",
                        }}
                      >
                        新規
                      </span>
                    )}
                  </span>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <label
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      配点:
                      <input
                        type="number"
                        min={0}
                        value={tc.score}
                        onChange={(e) =>
                          updateTc(idx, "score", Number(e.target.value))
                        }
                        style={{
                          width: 48,
                          border: "1px solid var(--color-border)",
                          borderRadius: 4,
                          padding: "2px 6px",
                          fontSize: "0.75rem",
                          background: "var(--color-surface)",
                          outline: "none",
                          color: "var(--color-text-primary)",
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeTestCase(idx)}
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-danger)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      削除
                    </button>
                  </div>
                </div>
                <div
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
                >
                  <div
                    style={{
                      padding: 12,
                      borderRight: "1px solid var(--color-border)",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.6875rem",
                        color: "var(--color-text-muted)",
                        marginBottom: 4,
                      }}
                    >
                      入力
                    </label>
                    <textarea
                      rows={3}
                      value={tc.input}
                      onChange={(e) => updateTc(idx, "input", e.target.value)}
                      placeholder="標準入力"
                      className="code-editor"
                      style={{
                        width: "100%",
                        border: "none",
                        resize: "none",
                        outline: "none",
                        background: "transparent",
                        color: "var(--color-text-primary)",
                        fontFamily: "var(--font-geist-mono, monospace)",
                        fontSize: "0.8125rem",
                      }}
                    />
                  </div>
                  <div style={{ padding: 12 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.6875rem",
                        color: "var(--color-text-muted)",
                        marginBottom: 4,
                      }}
                    >
                      期待される出力
                    </label>
                    <textarea
                      rows={3}
                      value={tc.expectedOutput}
                      onChange={(e) =>
                        updateTc(idx, "expectedOutput", e.target.value)
                      }
                      placeholder="期待する出力"
                      className="code-editor"
                      style={{
                        width: "100%",
                        border: "none",
                        resize: "none",
                        outline: "none",
                        background: "transparent",
                        color: "var(--color-text-primary)",
                        fontFamily: "var(--font-geist-mono, monospace)",
                        fontSize: "0.8125rem",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {rootError && (
        <p
          style={{
            marginBottom: 12,
            fontSize: "0.8125rem",
            color: "var(--color-danger)",
          }}
        >
          {rootError}
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          type="submit"
          disabled={isBusy}
          style={{
            padding: "10px 24px",
            background: isBusy ? "#b0c8ef" : "var(--color-primary)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: "0.9375rem",
            fontWeight: 500,
            cursor: isBusy ? "not-allowed" : "pointer",
          }}
        >
          {isBusy ? "更新中..." : "課題を更新する"}
        </button>
        <Link
          href={`/teacher/classes/${courseId}/assignments/${assignment.id}/submissions`}
          style={{
            fontSize: "0.875rem",
            color: "var(--color-text-muted)",
            textDecoration: "none",
          }}
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}

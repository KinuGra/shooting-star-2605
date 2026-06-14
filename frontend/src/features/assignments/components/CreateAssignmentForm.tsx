"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  useCreateAssignment,
  createTestCase,
} from "@/api/generated/assignments/assignments";

const LANGUAGES = ["Python", "JavaScript", "C", "C++", "Java"];

const testCaseSchema = z.object({
  input: z.string().min(1, "入力を入力してください"),
  expectedOutput: z.string().min(1, "期待される出力を入力してください"),
  score: z.number().min(0),
});

const createAssignmentSchema = z.object({
  title: z.string().min(1, "課題名を入力してください"),
  description: z.string().optional(),
  submissionType: z.enum(["CODE", "FILE", "REPORT"]),
  languages: z.array(z.string()).min(1, "言語を選択してください"),
  deadlineAt: z.string().min(1, "提出期限を設定してください"),
  isPublished: z.boolean(),
  maxScore: z.number().min(0).optional(),
  testCases: z
    .array(testCaseSchema)
    .min(1, "テストケースを1つ以上追加してください"),
});

type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>;

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

interface Props {
  courseId: string;
}

export function CreateAssignmentForm({ courseId }: Props) {
  const router = useRouter();
  const { trigger: createAssignmentMutation, isMutating } =
    useCreateAssignment(courseId);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors },
  } = useForm<CreateAssignmentFormData>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      submissionType: "CODE",
      languages: ["Python"],
      isPublished: true,
      testCases: [{ input: "", expectedOutput: "", score: 10 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "testCases",
  });

  const isPublished = watch("isPublished");

  const onSubmit = async (data: CreateAssignmentFormData) => {
    try {
      const deadline = new Date(data.deadlineAt).toISOString();
      const result = await createAssignmentMutation({
        title: data.title,
        description: data.description,
        submissionType: data.submissionType,
        languages: data.languages,
        deadlineAt: deadline,
        isPublished: data.isPublished,
        maxScore: data.maxScore,
      });

      const assignmentId = result?.data?.id;
      if (assignmentId) {
        for (let i = 0; i < data.testCases.length; i++) {
          const tc = data.testCases[i];
          await createTestCase(assignmentId, {
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            score: tc.score,
            orderIndex: i,
          });
        }
      }

      router.push(`/teacher/classes/${courseId}`);
      router.refresh();
    } catch {
      setError("root", { message: "課題の作成に失敗しました。" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
            placeholder="例: 二分探索アルゴリズムの実装"
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
            placeholder={
              "Markdown 形式で記述できます。\n\n## 問題\n...\n\n## 入力形式\n..."
            }
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
            <label style={labelStyle}>提出タイプ</label>
            <select {...register("submissionType")} style={{ ...inputStyle }}>
              <option value="CODE">コード</option>
              <option value="FILE">ファイル</option>
              <option value="REPORT">レポート</option>
            </select>
          </div>
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
          </h2>
          <button
            type="button"
            onClick={() => append({ input: "", expectedOutput: "", score: 10 })}
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

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {fields.map((field, idx) => (
            <div
              key={field.id}
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
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                      {...register(`testCases.${idx}.score`, {
                        valueAsNumber: true,
                      })}
                      type="number"
                      min={0}
                      style={{
                        width: 48,
                        border: "1px solid var(--color-border)",
                        borderRadius: 4,
                        padding: "2px 6px",
                        fontSize: "0.75rem",
                        background: "var(--color-surface)",
                        outline: "none",
                      }}
                    />
                  </label>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(idx)}
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
                  )}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
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
                    {...register(`testCases.${idx}.input`)}
                    rows={3}
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
                    {...register(`testCases.${idx}.expectedOutput`)}
                    rows={3}
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
      </section>

      {errors.root && (
        <p
          style={{
            marginBottom: 12,
            fontSize: "0.8125rem",
            color: "var(--color-danger)",
          }}
        >
          {errors.root.message}
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          type="submit"
          disabled={isMutating}
          style={{
            padding: "10px 24px",
            background: isMutating ? "#b0c8ef" : "var(--color-primary)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: "0.9375rem",
            fontWeight: 500,
            cursor: isMutating ? "not-allowed" : "pointer",
          }}
        >
          {isMutating ? "作成中..." : "課題を作成する"}
        </button>
        <Link
          href={`/teacher/classes/${courseId}`}
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

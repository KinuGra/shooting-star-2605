import type {
  Assignment,
  AssignmentSummary,
  Class,
  ClassGrade,
  Submission,
  TestCase,
} from "./types";

// ─── Classes ────────────────────────────────────────────────────────────────

export const MOCK_CLASSES: Class[] = [
  {
    id: "cls-1",
    name: "データ構造・アルゴリズム",
    teacherName: "田中 誠教授",
    inviteCode: "DS2024A",
    studentCount: 32,
    assignmentCount: 10,
  },
  {
    id: "cls-2",
    name: "Webアプリケーション開発",
    teacherName: "佐藤 花TA",
    inviteCode: "WEB2024B",
    studentCount: 28,
    assignmentCount: 7,
  },
  {
    id: "cls-3",
    name: "プログラミング基礎",
    teacherName: "山田 一郎教授",
    inviteCode: "PROG2024C",
    studentCount: 45,
    assignmentCount: 12,
  },
];

// ─── Assignments ─────────────────────────────────────────────────────────────

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "asgn-1",
    classId: "cls-1",
    title: "Hello World",
    description: `## 問題

標準入力から文字列を受け取り、そのまま標準出力に出力してください。

## 入力形式

1行の文字列 S (1 ≤ |S| ≤ 100)

## 出力形式

文字列 S をそのまま出力してください。

## 制約

- 1 ≤ |S| ≤ 100
- S は英数字と空白のみからなる

## サンプル入力

\`\`\`
Hello World
\`\`\`

## サンプル出力

\`\`\`
Hello World
\`\`\``,
    language: "Python",
    deadline: "2024-06-01T23:59:00",
    maxScore: 10,
    isPublic: true,
  },
  {
    id: "asgn-2",
    classId: "cls-1",
    title: "配列のソート",
    description: `## 問題

N個の整数が与えられます。これらを昇順にソートして出力してください。

## 入力形式

1行目: N (1 ≤ N ≤ 1000)
2行目: N個の整数 a_1, a_2, ..., a_N (0 ≤ a_i ≤ 10^9)

## 出力形式

ソートされた整数を空白区切りで1行に出力してください。

## 制約

- 1 ≤ N ≤ 1000
- 0 ≤ a_i ≤ 10^9

## サンプル入力

\`\`\`
5
3 1 4 1 5
\`\`\`

## サンプル出力

\`\`\`
1 1 3 4 5
\`\`\``,
    language: "Python",
    deadline: "2024-06-08T23:59:00",
    maxScore: 10,
    isPublic: true,
  },
  {
    id: "asgn-3",
    classId: "cls-1",
    title: "二分探索",
    description: `## 問題

ソート済みのN個の整数の配列と、Q個のクエリが与えられます。
各クエリに対して、指定された値が配列に存在するかどうかを判定してください。

## 入力形式

1行目: N (1 ≤ N ≤ 10^5)
2行目: N個の整数（昇順）
3行目: Q (1 ≤ Q ≤ 10^5)
4〜Q+3行目: クエリの値 x_i

## 出力形式

各クエリに対して "Yes" または "No" を出力してください。

## 制約

- 1 ≤ N, Q ≤ 10^5
- 0 ≤ a_i, x_i ≤ 10^9

## サンプル入力

\`\`\`
5
1 3 5 7 9
3
5
6
1
\`\`\`

## サンプル出力

\`\`\`
Yes
No
Yes
\`\`\``,
    language: "Python",
    deadline: "2026-06-20T23:59:00",
    maxScore: 10,
    isPublic: true,
  },
  {
    id: "asgn-4",
    classId: "cls-1",
    title: "グラフのBFS",
    description: `## 問題

無向グラフが与えられます。頂点1から各頂点への最短距離を求めてください。

## 入力形式

N M (頂点数、辺数)
以下M行: u v (辺の両端点)

## 出力形式

頂点1から各頂点への最短距離を出力（到達不能は-1）

## サンプル入力

\`\`\`
4 4
1 2
1 3
2 4
3 4
\`\`\`

## サンプル出力

\`\`\`
0 1 1 2
\`\`\``,
    language: "Python",
    deadline: "2026-06-27T23:59:00",
    maxScore: 20,
    isPublic: true,
  },
  {
    id: "asgn-5",
    classId: "cls-1",
    title: "動的計画法 - フィボナッチ",
    description: "DPを使ってフィボナッチ数列のN番目を効率的に求めてください。",
    language: "Python",
    deadline: "2026-07-04T23:59:00",
    maxScore: 15,
    isPublic: false,
  },
];

export const MOCK_TEST_CASES: TestCase[] = [
  { id: "tc-1", input: "Hello World", expectedOutput: "Hello World" },
  { id: "tc-2", input: "ShootingStar", expectedOutput: "ShootingStar" },
  { id: "tc-3", input: "Test 123", expectedOutput: "Test 123" },
];

// ─── Submissions ──────────────────────────────────────────────────────────────

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: "sub-1",
    assignmentId: "asgn-1",
    studentId: "stu-1",
    studentName: "山田 太郎",
    code: `s = input()
print(s)`,
    language: "Python",
    submittedAt: "2024-05-30T14:33:00",
    status: "AC",
    score: 10,
    maxScore: 10,
    testResults: [
      {
        testCaseId: "tc-1",
        label: "ケース1",
        status: "AC",
        executionTimeMs: 12,
        memoryKb: 2048,
      },
      {
        testCaseId: "tc-2",
        label: "ケース2",
        status: "AC",
        executionTimeMs: 15,
        memoryKb: 2048,
      },
      {
        testCaseId: "tc-3",
        label: "ケース3",
        status: "AC",
        executionTimeMs: 8,
        memoryKb: 2048,
      },
    ],
    teacherComment:
      "完璧な解答です。シンプルで読みやすいコードが書けています。",
  },
  {
    id: "sub-2",
    assignmentId: "asgn-2",
    studentId: "stu-1",
    studentName: "山田 太郎",
    code: `n = int(input())
a = list(map(int, input().split()))
a.sort()
print(*a)`,
    language: "Python",
    submittedAt: "2024-06-05T10:22:00",
    status: "AC",
    score: 10,
    maxScore: 10,
    testResults: [
      {
        testCaseId: "tc-1",
        label: "ケース1",
        status: "AC",
        executionTimeMs: 18,
        memoryKb: 4096,
      },
      {
        testCaseId: "tc-2",
        label: "ケース2",
        status: "AC",
        executionTimeMs: 22,
        memoryKb: 4096,
      },
    ],
    teacherComment: "バックエンドのソートアルゴリズムも理解できているか確認しましょう。",
  },
  {
    id: "sub-3",
    assignmentId: "asgn-2",
    studentId: "stu-2",
    studentName: "鈴木 花子",
    code: `n = int(input())
a = list(map(int, input().split()))
# バブルソート
for i in range(n):
    for j in range(n-i-1):
        if a[j] > a[j+1]:
            a[j], a[j+1] = a[j+1], a[j]
print(*a)`,
    language: "Python",
    submittedAt: "2024-06-06T16:10:00",
    status: "TLE",
    score: 6,
    maxScore: 10,
    testResults: [
      {
        testCaseId: "tc-1",
        label: "ケース1",
        status: "AC",
        executionTimeMs: 45,
        memoryKb: 4096,
      },
      {
        testCaseId: "tc-2",
        label: "ケース2",
        status: "TLE",
        executionTimeMs: 2000,
        memoryKb: 4096,
      },
    ],
    teacherComment:
      "バブルソートはO(N²)で大きな入力に対して遅くなります。より効率的なアルゴリズムを試してみましょう。",
  },
  {
    id: "sub-4",
    assignmentId: "asgn-2",
    studentId: "stu-3",
    studentName: "佐藤 健",
    code: `n = int(input())
a = input().split()
# 型変換忘れ
a.sort()
print(*a)`,
    language: "Python",
    submittedAt: "2024-06-07T09:15:00",
    status: "WA",
    score: 3,
    maxScore: 10,
    testResults: [
      {
        testCaseId: "tc-1",
        label: "ケース1",
        status: "WA",
        executionTimeMs: 20,
        memoryKb: 3000,
      },
      {
        testCaseId: "tc-2",
        label: "ケース2",
        status: "WA",
        executionTimeMs: 25,
        memoryKb: 3000,
      },
    ],
  },
];

// ─── Derived helpers ──────────────────────────────────────────────────────────

export function getAssignmentSummaries(classId: string): AssignmentSummary[] {
  const assignments = MOCK_ASSIGNMENTS.filter((a) => a.classId === classId);
  return assignments.map((assignment) => {
    const mySubmissions = MOCK_SUBMISSIONS.filter(
      (s) => s.assignmentId === assignment.id && s.studentId === "stu-1",
    );
    const myLastSubmission =
      mySubmissions.length > 0
        ? mySubmissions.sort(
            (a, b) =>
              new Date(b.submittedAt).getTime() -
              new Date(a.submittedAt).getTime(),
          )[0]
        : undefined;
    return { assignment, myLastSubmission };
  });
}

export function getClassGrades(): ClassGrade[] {
  return [
    {
      classId: "cls-1",
      className: "データ構造・アルゴリズム",
      teacherName: "田中 誠教授",
      totalScore: 43,
      maxTotalScore: 65,
      completedAssignments: 2,
      totalAssignments: 5,
    },
    {
      classId: "cls-2",
      className: "Webアプリケーション開発",
      teacherName: "佐藤 花TA",
      totalScore: 58,
      maxTotalScore: 70,
      completedAssignments: 5,
      totalAssignments: 7,
    },
    {
      classId: "cls-3",
      className: "プログラミング基礎",
      teacherName: "山田 一郎教授",
      totalScore: 90,
      maxTotalScore: 100,
      completedAssignments: 10,
      totalAssignments: 12,
    },
  ];
}

export function getSubmissionsForAssignment(
  assignmentId: string,
): Submission[] {
  return MOCK_SUBMISSIONS.filter((s) => s.assignmentId === assignmentId);
}

export function getTeacherClasses(): (Class & {
  gradedCount: number;
  ungradedCount: number;
})[] {
  return [
    {
      ...MOCK_CLASSES[0],
      gradedCount: 18,
      ungradedCount: 5,
    },
    {
      ...MOCK_CLASSES[1],
      gradedCount: 42,
      ungradedCount: 3,
    },
  ];
}

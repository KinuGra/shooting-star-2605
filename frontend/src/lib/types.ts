export type UserRole = "student" | "teacher" | "owner";

export type JudgeStatus =
  | "AC"
  | "WA"
  | "TLE"
  | "CE"
  | "RE"
  | "MLE"
  | "pending"
  | "running";

export interface Class {
  id: string;
  name: string;
  teacherName: string;
  inviteCode: string;
  studentCount: number;
  assignmentCount: number;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description: string;
  language: string;
  deadline: string;
  maxScore: number;
  isPublic: boolean;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
}

export interface TestResult {
  testCaseId: string;
  label: string;
  status: JudgeStatus;
  executionTimeMs: number;
  memoryKb: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  code: string;
  language: string;
  submittedAt: string;
  status: JudgeStatus;
  score: number;
  maxScore: number;
  testResults: TestResult[];
  teacherComment?: string;
}

export interface ClassGrade {
  classId: string;
  className: string;
  teacherName: string;
  totalScore: number;
  maxTotalScore: number;
  completedAssignments: number;
  totalAssignments: number;
}

export interface AssignmentSummary {
  assignment: Assignment;
  myLastSubmission?: Submission;
}

package com.shootingstar.security;

import com.shootingstar.entity.*;
import com.shootingstar.repository.*;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Component
@Order(2)
public class SeedDataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentLanguageRepository assignmentLanguageRepository;
    private final TestCaseRepository testCaseRepository;
    private final PasswordEncoder passwordEncoder;

    public SeedDataInitializer(
            UserRepository userRepository,
            CourseRepository courseRepository,
            CourseEnrollmentRepository courseEnrollmentRepository,
            AssignmentRepository assignmentRepository,
            AssignmentLanguageRepository assignmentLanguageRepository,
            TestCaseRepository testCaseRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.courseEnrollmentRepository = courseEnrollmentRepository;
        this.assignmentRepository = assignmentRepository;
        this.assignmentLanguageRepository = assignmentLanguageRepository;
        this.testCaseRepository = testCaseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.findByEmail("s01@student.example.com").isPresent()) return;

        // ── 学生アカウント作成 ──────────────────────────────────────────────
        User s1 = makeStudent("s01@student.example.com", "田中 一郎");
        User s2 = makeStudent("s02@student.example.com", "佐藤 花子");
        User s3 = makeStudent("s03@student.example.com", "鈴木 太郎");
        User s4 = makeStudent("s04@student.example.com", "高橋 美咲");
        User s5 = makeStudent("s05@student.example.com", "伊藤 健太");
        List<User> students = List.of(s1, s2, s3, s4, s5);

        // ── 教員を取得（DataInitializer で作成済み） ──────────────────────
        User teacher = userRepository.findByEmail("teacher@shootingstar.com")
                .orElseThrow(() -> new IllegalStateException("Seed failed: teacher account not found"));

        // ── 授業作成 ─────────────────────────────────────────────────────────
        Course c1 = makeCourse(teacher, "プログラミング入門",             "Pythonでプログラミングの基礎を学ぶ入門コース",                      "INTRO-PY01");
        Course c2 = makeCourse(teacher, "データ構造とアルゴリズム",        "Javaを用いてデータ構造とアルゴリズムを学ぶ",                        "DS-ALGO01");
        Course c3 = makeCourse(teacher, "C言語プログラミング",              "C言語の基礎から実践的なプログラミングを学ぶ",                       "CLANG-001");
        Course c4 = makeCourse(teacher, "Webバックエンド開発",              "Node.js (JavaScript) でサーバーサイドプログラミングを学ぶ",         "WEB-JS001");
        Course c5 = makeCourse(teacher, "オブジェクト指向プログラミング",   "Javaによるオブジェクト指向設計と実装を学ぶ",                        "OOP-JAVA1");
        Course c6 = makeCourse(teacher, "アルゴリズム設計",                 "探索・ソート・動的計画法など代表的なアルゴリズムを設計・実装する",   "ALG-DES01");
        Course c7 = makeCourse(teacher, "C++プログラミング",                "C++のSTL活用とオブジェクト指向を学ぶ",                              "CPP-PRG01");

        List<Course> courses = List.of(c1, c2, c3, c4, c5, c6, c7);

        // ── 全学生を全授業に登録 ─────────────────────────────────────────────
        for (Course course : courses) {
            for (User student : students) {
                enroll(course, student);
            }
        }

        // ── 課題とテストケースを作成 ─────────────────────────────────────────
        seedCourse1(c1);
        seedCourse2(c2);
        seedCourse3(c3);
        seedCourse4(c4);
        seedCourse5(c5);
        seedCourse6(c6);
        seedCourse7(c7);
    }

    // ── Course 1: プログラミング入門 (Python) — 5 課題 ───────────────────────
    private void seedCourse1(Course c) {
        makeAssignment(c, "Hello World",
            "標準入力を受け取らず \"Hello, World!\" と出力するプログラムを作成せよ。",
            "python3",
            List.of(
                new TC("", "Hello, World!", 100)
            ));

        makeAssignment(c, "整数の和",
            "2つの整数をそれぞれ1行ずつ読み込み、その和を出力せよ。",
            "python3",
            List.of(
                new TC("3\n5",   "8",   30),
                new TC("10\n20", "30",  30),
                new TC("-5\n3",  "-2",  40)
            ));

        makeAssignment(c, "FizzBuzz",
            "整数Nを読み込み、1からNまでの各数を改行区切りで出力せよ。" +
            "3の倍数は\"Fizz\"、5の倍数は\"Buzz\"、両方の倍数は\"FizzBuzz\"と出力すること。",
            "python3",
            List.of(
                new TC("15",
                    "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz",
                    50),
                new TC("5",
                    "1\n2\nFizz\n4\nBuzz",
                    50)
            ));

        makeAssignment(c, "回文判定",
            "文字列を1行読み込み、回文であれば\"Yes\"、そうでなければ\"No\"を出力せよ。",
            "python3",
            List.of(
                new TC("racecar", "Yes", 30),
                new TC("hello",   "No",  30),
                new TC("madam",   "Yes", 40)
            ));

        makeAssignment(c, "最大値と最小値",
            "1行目にN、2行目にN個の整数をスペース区切りで読み込み、最大値と最小値をそれぞれ改行区切りで出力せよ。",
            "python3",
            List.of(
                new TC("5\n3 1 4 1 5",   "5\n1",    50),
                new TC("3\n100 200 150", "200\n100", 50)
            ));
    }

    // ── Course 2: データ構造とアルゴリズム (Java) — 6 課題 ──────────────────
    private void seedCourse2(Course c) {
        makeAssignment(c, "配列の合計",
            "1行目にN、2行目にN個の整数をスペース区切りで読み込み、合計を出力せよ。クラス名はMainとすること。",
            "java",
            List.of(
                new TC("5\n1 2 3 4 5", "15", 50),
                new TC("3\n10 20 30",  "60", 50)
            ));

        makeAssignment(c, "素数判定",
            "整数Nを読み込み、素数なら\"Yes\"、そうでなければ\"No\"を出力せよ。クラス名はMainとすること。",
            "java",
            List.of(
                new TC("7", "Yes", 30),
                new TC("4", "No",  30),
                new TC("2", "Yes", 40)
            ));

        makeAssignment(c, "バブルソート",
            "1行目にN、2行目にN個の整数をスペース区切りで読み込み、バブルソートで昇順にソートしてスペース区切りで出力せよ。クラス名はMainとすること。",
            "java",
            List.of(
                new TC("5\n5 3 1 4 2", "1 2 3 4 5", 50),
                new TC("4\n9 1 5 3",   "1 3 5 9",   50)
            ));

        makeAssignment(c, "スタックによる括弧の対応確認",
            "'('と')'のみからなる文字列を読み込み、括弧が正しく対応していれば\"Yes\"、そうでなければ\"No\"を出力せよ。クラス名はMainとすること。",
            "java",
            List.of(
                new TC("(())", "Yes", 30),
                new TC("(()",  "No",  30),
                new TC("()()", "Yes", 40)
            ));

        makeAssignment(c, "二分探索",
            "1行目にN、2行目にN個のソート済み整数（スペース区切り）、3行目にXを読み込み、Xの0-indexedインデックスを出力せよ。存在しなければ-1を出力せよ。クラス名はMainとすること。",
            "java",
            List.of(
                new TC("5\n1 3 5 7 9\n5",        "2",  30),
                new TC("5\n1 3 5 7 9\n6",        "-1", 30),
                new TC("7\n2 4 6 8 10 12 14\n10", "4",  40)
            ));

        makeAssignment(c, "フィボナッチ数列",
            "整数N (0≤N≤40) を読み込み、フィボナッチ数列のN番目の値（F(0)=0, F(1)=1）を出力せよ。クラス名はMainとすること。",
            "java",
            List.of(
                new TC("10", "55", 30),
                new TC("0",  "0",  30),
                new TC("1",  "1",  40)
            ));
    }

    // ── Course 3: C言語プログラミング (C) — 5 課題 ──────────────────────────
    private void seedCourse3(Course c) {
        makeAssignment(c, "整数の四則演算",
            "2つの整数AとBをそれぞれ1行ずつ読み込み、和・差・積・商（整数除算）をそれぞれ改行区切りで出力せよ。",
            "c",
            List.of(
                new TC("10\n3", "13\n7\n30\n3",  50),
                new TC("20\n4", "24\n16\n80\n5", 50)
            ));

        makeAssignment(c, "素数判定",
            "整数Nを読み込み、素数なら\"Yes\"、そうでなければ\"No\"を出力せよ。",
            "c",
            List.of(
                new TC("7", "Yes", 30),
                new TC("9", "No",  30),
                new TC("2", "Yes", 40)
            ));

        makeAssignment(c, "配列の逆順出力",
            "1行目にN、2行目にN個の整数をスペース区切りで読み込み、逆順にスペース区切りで出力せよ。",
            "c",
            List.of(
                new TC("5\n1 2 3 4 5", "5 4 3 2 1", 50),
                new TC("3\n10 20 30",  "30 20 10",  50)
            ));

        makeAssignment(c, "最大公約数（ユークリッドの互除法）",
            "2つの整数をそれぞれ1行ずつ読み込み、ユークリッドの互除法で最大公約数を出力せよ。",
            "c",
            List.of(
                new TC("12\n8",   "4",  30),
                new TC("100\n75", "25", 30),
                new TC("17\n13",  "1",  40)
            ));

        makeAssignment(c, "ポインタを使った配列の2倍",
            "1行目にN、2行目にN個の整数をスペース区切りで読み込み、ポインタを使って各要素を2倍にしてスペース区切りで出力せよ。",
            "c",
            List.of(
                new TC("4\n1 2 3 4",  "2 4 6 8",   50),
                new TC("3\n5 10 15",  "10 20 30",  50)
            ));
    }

    // ── Course 4: Webバックエンド開発 (JavaScript) — 6 課題 ─────────────────
    private void seedCourse4(Course c) {
        makeAssignment(c, "配列の合計と平均",
            "1行目にN、2行目にN個の整数をスペース区切りで読み込み、合計と平均（整数部分のみ）をそれぞれ改行区切りで出力せよ。",
            "javascript",
            List.of(
                new TC("4\n10 20 30 40", "100\n25", 50),
                new TC("3\n1 2 3",        "6\n2",    50)
            ));

        makeAssignment(c, "文字列の逆順",
            "文字列を1行読み込み、逆順にした文字列を出力せよ。",
            "javascript",
            List.of(
                new TC("hello",      "olleh",      30),
                new TC("JavaScript", "tpircSavaJ", 30),
                new TC("12345",      "54321",      40)
            ));

        makeAssignment(c, "重複除去と昇順出力",
            "1行目にN、2行目にN個の整数をスペース区切りで読み込み、重複を除いて昇順でスペース区切りで出力せよ。",
            "javascript",
            List.of(
                new TC("5\n3 1 4 1 5", "1 3 4 5", 50),
                new TC("4\n2 2 2 1",   "1 2",     50)
            ));

        makeAssignment(c, "素数の列挙",
            "整数Nを読み込み、2以上N以下の素数をスペース区切りで出力せよ。",
            "javascript",
            List.of(
                new TC("20", "2 3 5 7 11 13 17 19", 50),
                new TC("10", "2 3 5 7",              50)
            ));

        makeAssignment(c, "単語数カウント",
            "文字列を1行読み込み、スペースで区切られた単語の数を出力せよ。",
            "javascript",
            List.of(
                new TC("hello world",         "2", 30),
                new TC("the quick brown fox", "4", 30),
                new TC("one",                 "1", 40)
            ));

        makeAssignment(c, "ソートと中央値",
            "1行目にN（奇数）、2行目にN個の整数をスペース区切りで読み込み、ソートして中央値を出力せよ。",
            "javascript",
            List.of(
                new TC("5\n3 1 4 1 5", "3",  50),
                new TC("3\n10 20 30",  "20", 50)
            ));
    }

    // ── Course 5: オブジェクト指向プログラミング (Java) — 7 課題 ────────────
    private void seedCourse5(Course c) {
        makeAssignment(c, "整数の絶対値",
            "整数Nを読み込み、絶対値を出力せよ。クラス名はMainとすること。",
            "java",
            List.of(
                new TC("-5", "5", 30),
                new TC("3",  "3", 30),
                new TC("0",  "0", 40)
            ));

        makeAssignment(c, "三角形の面積",
            "底辺と高さをそれぞれ1行ずつ整数で読み込み、面積（底辺×高さ÷2、整数演算）を出力せよ。クラス名はMainとすること。",
            "java",
            List.of(
                new TC("10\n4", "20", 50),
                new TC("6\n3",  "9",  50)
            ));

        makeAssignment(c, "最小公倍数",
            "2つの整数をそれぞれ1行ずつ読み込み、最小公倍数(LCM)を出力せよ。クラス名はMainとすること。",
            "java",
            List.of(
                new TC("4\n6",   "12", 30),
                new TC("7\n3",   "21", 30),
                new TC("12\n18", "36", 40)
            ));

        makeAssignment(c, "文字の出現回数",
            "1行目に文字列、2行目に1文字を読み込み、その文字が文字列中に何回出現するかを出力せよ。クラス名はMainとすること。",
            "java",
            List.of(
                new TC("hello\nl",       "2", 50),
                new TC("programming\ng", "2", 50)
            ));

        makeAssignment(c, "二次方程式の判別",
            "ax²+bx+c=0の係数a, b, cをそれぞれ1行ずつ整数で読み込み、判別式D=b²-4acに基づいて " +
            "\"2 roots\"(D>0)、\"1 root\"(D=0)、\"no roots\"(D<0) を出力せよ。クラス名はMainとすること。",
            "java",
            List.of(
                new TC("1\n-5\n6", "2 roots",  30),
                new TC("1\n2\n1",  "1 root",   30),
                new TC("1\n0\n1",  "no roots", 40)
            ));

        makeAssignment(c, "2×2行列の転置",
            "2×2の整数行列を2行で読み込み（各行スペース区切り）、転置行列を同じ形式で出力せよ。クラス名はMainとすること。",
            "java",
            List.of(
                new TC("1 2\n3 4", "1 3\n2 4", 50),
                new TC("5 6\n7 8", "5 7\n6 8", 50)
            ));

        makeAssignment(c, "配列の中央値",
            "1行目にN（奇数）、2行目にN個の整数をスペース区切りで読み込み、ソートして中央値を出力せよ。クラス名はMainとすること。",
            "java",
            List.of(
                new TC("5\n3 1 4 1 5", "3",  50),
                new TC("3\n10 20 30",  "20", 50)
            ));
    }

    // ── Course 6: アルゴリズム設計 (Python) — 6 課題 ────────────────────────
    private void seedCourse6(Course c) {
        makeAssignment(c, "二分探索",
            "1行目にN、2行目にN個のソート済み整数（スペース区切り）、3行目にXを読み込み、Xの0-indexedインデックスを出力せよ。存在しなければ-1を出力せよ。",
            "python3",
            List.of(
                new TC("5\n1 3 5 7 9\n5",         "2",  30),
                new TC("5\n1 3 5 7 9\n4",         "-1", 30),
                new TC("7\n2 4 6 8 10 12 14\n10", "4",  40)
            ));

        makeAssignment(c, "選択ソート",
            "1行目にN、2行目にN個の整数をスペース区切りで読み込み、選択ソートで昇順にソートしてスペース区切りで出力せよ。",
            "python3",
            List.of(
                new TC("5\n64 25 12 22 11", "11 12 22 25 64", 50),
                new TC("4\n4 3 2 1",         "1 2 3 4",        50)
            ));

        makeAssignment(c, "動的計画法: コイン問題",
            "1行目にコインの種類数N、2行目にN個の額面をスペース区切りで、3行目に目標金額Wを読み込み、" +
            "Wを作るのに必要な最小コイン枚数を出力せよ。作れない場合は-1を出力せよ。",
            "python3",
            List.of(
                new TC("3\n1 5 6\n11", "2",  30),
                new TC("2\n1 3\n5",    "3",  30),
                new TC("1\n2\n3",      "-1", 40)
            ));

        makeAssignment(c, "再帰: ハノイの塔の移動回数",
            "整数N（円盤の枚数）を読み込み、ハノイの塔を解くのに必要な最小移動回数（2^N - 1）を出力せよ。",
            "python3",
            List.of(
                new TC("1", "1",  30),
                new TC("3", "7",  30),
                new TC("5", "31", 40)
            ));

        makeAssignment(c, "貪欲法: 区間スケジューリング",
            "1行目に区間数N、続くN行に開始時刻と終了時刻をスペース区切りで読み込み、" +
            "重複しない区間を最大個数選んだときの個数を出力せよ。",
            "python3",
            List.of(
                new TC("4\n0 2\n1 3\n2 4\n3 5", "2", 50),
                new TC("3\n0 1\n1 2\n2 3",       "3", 50)
            ));

        makeAssignment(c, "最長増加部分列 (LIS)",
            "1行目にN、2行目にN個の整数をスペース区切りで読み込み、最長増加部分列（LIS）の長さを出力せよ。",
            "python3",
            List.of(
                new TC("8\n10 9 2 5 3 7 101 18", "4", 50),
                new TC("5\n3 10 2 1 20",          "3", 50)
            ));
    }

    // ── Course 7: C++プログラミング (C++) — 5 課題 ──────────────────────────
    private void seedCourse7(Course c) {
        makeAssignment(c, "ベクタの合計と平均",
            "1行目にN、2行目にN個の整数をスペース区切りで読み込み、std::vectorに格納して" +
            "合計と平均（整数部分のみ）をそれぞれ改行区切りで出力せよ。",
            "cpp",
            List.of(
                new TC("4\n10 20 30 40", "100\n25", 50),
                new TC("3\n1 2 3",        "6\n2",    50)
            ));

        makeAssignment(c, "文字列の大文字変換",
            "文字列を1行読み込み、std::transformとtoupper関数を使って全ての文字を大文字に変換して出力せよ。",
            "cpp",
            List.of(
                new TC("hello",     "HELLO",     30),
                new TC("World",     "WORLD",     30),
                new TC("cplusplus", "CPLUSPLUS", 40)
            ));

        makeAssignment(c, "最大値のインデックス",
            "1行目にN、2行目にN個の整数をスペース区切りで読み込み、最大値の0-indexedインデックスを出力せよ" +
            "（最大値が複数ある場合は最初のもの）。",
            "cpp",
            List.of(
                new TC("5\n3 1 4 1 5", "4", 50),
                new TC("3\n10 5 8",    "0", 50)
            ));

        makeAssignment(c, "std::swapによる値の交換",
            "2つの整数をそれぞれ1行ずつ読み込み、std::swapを使って値を入れ替えて、それぞれ改行区切りで出力せよ。",
            "cpp",
            List.of(
                new TC("3\n7",     "7\n3",     50),
                new TC("100\n200", "200\n100", 50)
            ));

        makeAssignment(c, "std::mapを使った単語頻度カウント",
            "文字列を1行読み込み、スペースで区切られた各単語の出現回数をstd::mapで数え、" +
            "アルファベット順に「単語 回数」の形式で出力せよ。",
            "cpp",
            List.of(
                new TC("apple banana apple cherry banana apple",
                    "apple 3\nbanana 2\ncherry 1", 50),
                new TC("hello world hello",
                    "hello 2\nworld 1",            50)
            ));
    }

    // ── ユーティリティメソッド ───────────────────────────────────────────────

    private User makeStudent(String email, String name) {
        User u = new User();
        u.setEmail(email);
        u.setName(name);
        u.setPasswordHash(passwordEncoder.encode("Student1234!"));
        u.setGlobalRole(GlobalRole.STUDENT);
        u.setEmailVerified(true);
        return userRepository.save(u);
    }

    private Course makeCourse(User owner, String name, String description, String inviteCode) {
        return courseRepository.findByInviteCode(inviteCode).orElseGet(() -> {
            Course c = new Course();
            c.setOwner(owner);
            c.setName(name);
            c.setDescription(description);
            c.setInviteCode(inviteCode);
            return courseRepository.save(c);
        });
    }

    private void enroll(Course course, User user) {
        if (courseEnrollmentRepository.existsByCourseAndUser(course, user)) return;
        CourseEnrollment e = new CourseEnrollment();
        e.setCourse(course);
        e.setUser(user);
        e.setRole(CourseRole.STUDENT);
        e.setEnrolledAt(OffsetDateTime.now());
        courseEnrollmentRepository.save(e);
    }

    private void makeAssignment(Course course, String title, String description,
                                String language, List<TC> testCases) {
        Assignment a = new Assignment();
        a.setCourse(course);
        a.setTitle(title);
        a.setDescription(description);
        a.setSubmissionType(SubmissionType.CODE);
        a.setIsPublished(true);
        a.setPublishAt(OffsetDateTime.now(ZoneOffset.UTC).minusDays(1));
        a.setDeadlineAt(OffsetDateTime.of(2026, 12, 31, 23, 59, 59, 0, ZoneOffset.UTC));
        a.setMaxScore(testCases.stream().mapToInt(TC::score).sum());
        assignmentRepository.save(a);

        AssignmentLanguage al = new AssignmentLanguage();
        al.setAssignment(a);
        al.setLanguage(language);
        assignmentLanguageRepository.save(al);

        for (int i = 0; i < testCases.size(); i++) {
            TC tc = testCases.get(i);
            TestCase testCase = new TestCase();
            testCase.setAssignment(a);
            testCase.setInput(tc.input());
            testCase.setExpectedOutput(tc.expectedOutput());
            testCase.setScore(tc.score());
            testCase.setOrderIndex(i);
            testCase.setCreatedAt(OffsetDateTime.now());
            testCaseRepository.save(testCase);
        }
    }

    private record TC(String input, String expectedOutput, int score) {}
}

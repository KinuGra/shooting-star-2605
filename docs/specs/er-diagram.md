# ER図

## エンティティ関連図

```mermaid
erDiagram
    users {
        UUID id PK
        VARCHAR email UK
        VARCHAR password_hash
        ENUM global_role "ADMIN | TEACHER | STUDENT"
        BOOLEAN email_verified
        BOOLEAN totp_enabled
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    user_totp_secrets {
        UUID id PK
        UUID user_id FK
        VARCHAR secret "暗号化して保存"
        TIMESTAMP created_at
    }

    user_totp_backup_codes {
        UUID id PK
        UUID user_id FK
        VARCHAR code_hash "bcryptハッシュ"
        BOOLEAN used
        TIMESTAMP used_at
        TIMESTAMP created_at
    }

    courses {
        UUID id PK
        UUID owner_id FK
        VARCHAR name
        TEXT description
        VARCHAR invite_code UK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    course_enrollments {
        UUID id PK
        UUID course_id FK
        UUID user_id FK
        ENUM role "STUDENT | TA"
        TIMESTAMP enrolled_at
    }

    assignments {
        UUID id PK
        UUID course_id FK
        VARCHAR title
        TEXT description
        ENUM submission_type "CODE | FILE | REPORT"
        BOOLEAN is_published
        TIMESTAMP publish_at
        TIMESTAMP deadline_at
        INTEGER max_score
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    assignment_languages {
        UUID id PK
        UUID assignment_id FK
        VARCHAR language "java | python | cpp | c など"
    }

    test_cases {
        UUID id PK
        UUID assignment_id FK
        TEXT input
        TEXT expected_output
        INTEGER score
        INTEGER order_index
    }

    submissions {
        UUID id PK
        UUID assignment_id FK
        UUID user_id FK
        VARCHAR language "CODE のみ"
        TEXT code_content "CODE のみ"
        TEXT file_url "FILE のみ"
        TEXT report_content "REPORT のみ"
        TIMESTAMP submitted_at
        BOOLEAN is_returned
        TIMESTAMP returned_at
        INTEGER score
    }

    judge_results {
        UUID id PK
        UUID submission_id FK
        UUID test_case_id FK
        ENUM status "AC | WA | TLE | MLE | RE | CE | IE"
        INTEGER execution_time_ms
        INTEGER memory_kb
    }

    feedback_comments {
        UUID id PK
        UUID submission_id FK
        UUID author_id FK
        INTEGER start_line
        INTEGER end_line
        TEXT body
        TIMESTAMP created_at
    }

    users ||--o| user_totp_secrets : "has"
    users ||--o{ user_totp_backup_codes : "has"
    users ||--o{ courses : "owns"
    users ||--o{ course_enrollments : "enrolled in"
    courses ||--o{ course_enrollments : "has"
    courses ||--o{ assignments : "has"
    assignments ||--o{ assignment_languages : "allows"
    assignments ||--o{ test_cases : "has"
    assignments ||--o{ submissions : "receives"
    users ||--o{ submissions : "submits"
    submissions ||--o{ judge_results : "has"
    test_cases ||--o{ judge_results : "tested in"
    submissions ||--o{ feedback_comments : "has"
    users ||--o{ feedback_comments : "writes"
```

---

## テーブル補足

### `users`
- `global_role` が `TEACHER` のアカウントは `ADMIN` のみ作成可能
- `email_verified` が `false` の場合はログイン不可
- `totp_enabled = true` の場合、ログイン時に TOTP コード入力が必要

### `user_totp_secrets`
- `users` と 1対1。TOTP 有効化時に生成、無効化時に削除
- `secret` はサーバーサイドで暗号化して保存

### `user_totp_backup_codes`
- 有効化時に8件生成。1件使用ごとに `used = true` にする
- `code_hash` は bcrypt ハッシュで保存（平文は表示時のみ）
- 再生成時は既存レコードをすべて削除して新規8件を作成

### `courses`
- `owner_id` は `global_role = TEACHER` のユーザーのみ
- `invite_code` は教師が再発行可能。再発行時に上書きされ、古いコードは無効

### `course_enrollments`
- 授業オーナー（TEACHER）はこのテーブルには登録しない
- `role` は初期値 `STUDENT`。教師が `TA` に変更可能

### `assignments`
- `submission_type = CODE` の場合のみ `assignment_languages` が有効
- `is_published = false` または `publish_at` が未来日時の場合、受講生には非表示
- `max_score` は `CODE` の場合 `test_cases.score` の合計と一致させる

### `submissions`
- 再提出可能。最後の提出（`submitted_at` が最新）が成績として扱われる
- `is_returned = false` の間、学生は `score` と `feedback_comments` を閲覧不可
- `submission_type = FILE / REPORT` の場合、`score` は教師・TAが手動入力

### `judge_results`
- `submission_type = CODE` のときのみ生成される
- ステータス: `AC`（正解）、`WA`（不正解）、`TLE`（時間超過）、`MLE`（メモリ超過）、`RE`（実行時エラー）、`CE`（コンパイルエラー）、`IE`（内部エラー）
- `score` は通過した `test_cases.score` の合計を `submissions.score` に反映する

### `feedback_comments`
- `submission_type = CODE` または `REPORT` のみ有効
- `author_id` は授業内ロールが `TEACHER` または `TA` のユーザーのみ

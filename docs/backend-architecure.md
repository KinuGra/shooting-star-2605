# バックエンドアーキテクチャ

## システム概要

大学のプログラミング授業における課題採点をDX化するWebアプリのバックエンド。  
教員・TA・講師の手動採点負担を削減するため、コード提出・自動採点・フィードバックをWebAPI経由で提供する。

- **フレームワーク**: Spring Boot 3.3.5 (Java 21)
- **ポート**: 8080
- **API仕様**: OpenAPI 3.0（springdoc-openapi）→ `/api-docs`、Swagger UI → `/swagger-ui.html`
- **DB**: PostgreSQL（JPA/Hibernate）

---

## レイヤー構成

```
┌─────────────────────────────────────────┐
│          Controller Layer               │  HTTP リクエスト受付・レスポンス返却
├─────────────────────────────────────────┤
│           Service Layer                 │  ビジネスロジック・トランザクション管理
├─────────────────────────────────────────┤
│         Repository Layer                │  DB アクセス（JPA）
├─────────────────────────────────────────┤
│          Entity / Domain                │  ドメインモデル・DB マッピング
└─────────────────────────────────────────┘
```

---

## パッケージ構成

```
com.shootingstar
├── controller/        # Controller Layer
├── service/           # Service Layer
├── repository/        # Repository Layer
├── entity/            # Entity / Domain
├── dto/               # リクエスト・レスポンス DTO
├── security/          # 認証・認可（JWT, Spring Security）
└── ShootingStarApplication.java
```

---

## 各レイヤーの責務

### Controller Layer (`controller/`)

- `@RestController` で REST API エンドポイントを定義する
- リクエストのバリデーション（`@Valid`）を行い、Service を呼び出してレスポンスを返す
- Swagger アノテーション（`@Tag`, `@Operation`）を付与する

```
HealthController       → GET /health
AuthController         → POST /auth/login, /auth/register, /auth/logout
UserController         → ユーザー管理（ADMIN用）
CourseController       → 授業 CRUD
AssignmentController   → 課題 CRUD・公開設定
SubmissionController   → 課題提出・提出結果閲覧
JudgeController        → 採点結果
FeedbackController     → フィードバックコメント
```

### Service Layer (`service/`)

- ビジネスロジックをすべてここに集約する
- `@Transactional` でトランザクション境界を管理する
- グローバルロール・授業内ロールによる認可チェックを行う
- 複数 Repository をまたぐ操作を調整する

### Repository Layer (`repository/`)

- `JpaRepository<Entity, UUID>` を継承したインターフェースで DB アクセスを行う
- カスタムクエリは `@Query` JPQL で定義する

### Entity / Domain (`entity/`)

- `@Entity` で DB テーブルにマッピングする
- 主キーはすべて UUID
- `@Enumerated(EnumType.STRING)` で ENUM 値を文字列保存する

---

## DTO 設計方針

- Controller の入出力は DTO（`dto/`）を使い、Entity を直接公開しない
- リクエスト: `XxxRequest`、レスポンス: `XxxResponse`
- バリデーションは Bean Validation アノテーションをリクエスト DTO に定義する

---

## OpenAPI / コード生成

バックエンドの OpenAPI スペック（`/api-docs`）からフロントエンド用 SWR フックと Zod スキーマを自動生成する。  
詳細は [コード生成ガイド](codegen.md) を参照。

コントローラーに `@Tag` / `@Operation` を付けることで生成物の品質が上がるため、必ず付与する。

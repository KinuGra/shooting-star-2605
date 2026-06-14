# ShootingStar — プログラミング課題採点DX

大学のプログラミング授業における、課題採点業務をDX化するWebアプリ。  
学生が提出したコードをジャッジサーバーで自動採点し、教員の採点負担を削減する。

---

## 背景・課題

大学のような法人のDX化が遅れているという社会課題を解決する。  
現状、教員が手動でコードを読んだり、一人一人の実行結果を確認しており非効率。  
これを効率化し、教員やTAの負担を減らす。

---

## 機能概要

### 学生向け

| 機能     | 説明                                            |
| -------- | ----------------------------------------------- |
| 授業参加 | 招待コードで授業に参加                          |
| 課題提出 | コードを提出（複数回可）                        |
| 即時採点 | ジャッジサーバーによる自動採点 + 教師のコメント |
| 成績確認 | 採点結果・成績一覧を確認                        |

**フロー**: 授業参加 → 課題提出 → 即時採点 → 成績確認

### オーナー・教師向け

| 機能     | 説明                                         |
| -------- | -------------------------------------------- |
| 授業作成 | 授業を作成・管理                             |
| 課題作成 | 内容・テストケース（in/out）・期限などを設定 |
| 提出管理 | 生徒ごとに提出を確認                         |
| 採点修正 | 自動採点結果の修正・コメントが可能           |

**フロー**: 授業作成 → 課題作成 → 提出確認 → 採点修正

---

## 技術スタック

| レイヤー         | 技術                                                  |
| ---------------- | ----------------------------------------------------- |
| バックエンド     | Java 21 / Spring Boot 3.3.5                           |
| フロントエンド   | Next.js 16 / React 19 / TypeScript                    |
| API クライアント | orval（OpenAPI → SWR フック + Zod スキーマ自動生成）  |
| データベース     | PostgreSQL 16                                         |
| ジャッジ         | Docker（Python / JavaScript / C / C++ / Java に対応） |
| インフラ         | AWS ECS Fargate（Terraform で管理）                   |

---

## リポジトリ構成

```
shooting-star-2605/
├── backend/          # Spring Boot アプリ
├── frontend/         # Next.js アプリ
├── docker/           # Dockerfile 群
├── infra/            # Terraform（AWS ECS Fargate）
├── docs/             # 設計・仕様ドキュメント
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── Makefile          # デプロイ用ショートカット
```

---

## 起動方法

### 前提条件

- [Docker](https://www.docker.com/) / Docker Compose

### 開発環境（推奨）

バックエンド・フロントエンド・DB をまとめて起動します。

```bash
docker compose -f docker-compose.dev.yml up
```

| サービス         | URL                                   |
| ---------------- | ------------------------------------- |
| フロントエンド   | http://localhost:3000                 |
| バックエンド API | http://localhost:8080                 |
| Swagger UI       | http://localhost:8080/swagger-ui.html |
| OpenAPI JSON     | http://localhost:8080/api-docs        |

> **ジャッジ機能を使う場合**  
> ホストの Docker ソケットをコンテナへマウントしているため、**ホスト上で Docker が動いている**必要があります。

#### フロントエンドだけローカルで動かす場合

バックエンドは Docker で起動しつつ、フロントエンドだけ Bun でローカル起動できます。

```bash
# バックエンドのみ起動
docker compose -f docker-compose.dev.yml up postgres backend

# 別ターミナルでフロントエンドを起動
cd frontend
bun install
bun run dev   # http://localhost:3000
```

#### IntelliJ IDEA でホットリロードを有効にする

Spring Boot DevTools によりクラスファイルの変更を検知して自動再起動します。

1. `Settings` → `Build, Execution, Deployment` → `Compiler` → **Build project automatically** をON
2. `Settings` → `Advanced Settings` → **Allow auto-make to start even if developed application is currently running** をON

変更を即反映したい場合は `Ctrl+F9`（Build Project）で手動トリガーできます。

---

## 開発コマンド

### バックエンド

開発環境は Docker 内で動くため、通常は下記コマンドを直接実行する必要はありません。  
Java 21 がローカルにある場合のみ使用できます。

```bash
cd backend
./gradlew bootRun   # ローカル起動
./gradlew test      # テスト実行
./gradlew build     # JAR ビルド
```

### フロントエンド

```bash
cd frontend

bun run dev       # 開発サーバー起動 (http://localhost:3000)
bun run build     # 本番ビルド
bun run lint      # Biome check（リント + フォーマットチェック）
bun run format    # Biome フォーマット（ファイルを自動修正）
bun run generate  # OpenAPI → API クライアント自動生成（バックエンド起動が必要）
```

### API クライアント再生成

バックエンドの API を変更したら以下を実行します。

```bash
# 1. バックエンドを起動
docker compose -f docker-compose.dev.yml up

# 2. 別ターミナルで生成
cd frontend
bun run generate
```

生成物（`src/api/generated/`・`src/api/model/`・`src/api/zod.generated.ts`）は手動編集禁止です。

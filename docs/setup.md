# セットアップガイド

- [バックエンド](#バックエンド)
- [フロントエンド](#フロントエンド)

---

## バックエンド

### 前提条件

- Docker / Docker Compose がインストールされていること

### 開発環境

#### 起動

```bash
docker compose -f docker-compose.dev.yml up
```

#### 構成

| 項目 | 内容 |
|------|------|
| ベースイメージ | `gradle:8.8-jdk21-alpine` |
| 起動コマンド | `gradle bootRun` |
| ポート | `8080` |
| Spring Profile | `dev` |

ソースコード (`./backend`) はコンテナ内の `/app` にマウントされます。

#### ホットリロード（IntelliJ IDEA）

Spring Boot DevTools により、クラスファイルの変更を検知して自動再起動します。

**設定手順**

1. `Settings` → `Build, Execution, Deployment` → `Compiler`
   - ✅ **Build project automatically** をON
2. `Settings` → `Advanced Settings`
   - ✅ **Allow auto-make to start even if developed application is currently running** をON

**動作の流れ**

```
ファイルを保存 → IntelliJ が自動コンパイル
  → ./backend/build/classes/ に .class 生成
  → ボリュームマウント経由でコンテナに反映
  → DevTools が検知して Spring Boot を再起動
```

- ファイル保存時に自動コンパイルが走ります
- すぐ反映させたい場合は `Ctrl+F9`（Build Project）で手動トリガーできます
- 初回起動後、初めてのコンパイルは `Ctrl+F9` で実行してください

### 本番環境

#### 起動

```bash
docker compose -f docker-compose.prod.yml up -d
```

#### 構成

| 項目 | 内容 |
|------|------|
| ビルド | マルチステージビルドで実行可能 JAR を生成 |
| ベースイメージ | `eclipse-temurin:21-jre-alpine` |
| ポート | `8080` |
| Spring Profile | `prod` |
| 再起動ポリシー | `unless-stopped` |

ソースのマウントはなく、コンテナ内にビルド済み JAR が含まれます。

### OpenAPI / Swagger

開発環境起動後、以下の URL にアクセスできます。

| URL | 内容 |
|-----|------|
| `http://localhost:8080/swagger-ui.html` | Swagger UI（ブラウザで操作可能なAPI一覧） |
| `http://localhost:8080/api-docs` | OpenAPI 仕様（JSON形式） |

#### アノテーション

コントローラーに以下のアノテーションを付けることで Swagger UI に情報が反映されます。

```java
@Tag(name = "グループ名", description = "説明")               // クラスに付ける
@Operation(summary = "概要", description = "詳細説明")         // メソッドに付ける
```

**例: HealthController**

```java
@RestController
@Tag(name = "Health", description = "ヘルスチェック")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "ヘルスチェック", description = "サーバーの稼働状態を確認する")
    public Map<String, String> health() {
        return Map.of("status", "UP!!");
    }
}
```

---

## フロントエンド

### 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 16 / React 19 / TypeScript |
| パッケージマネージャ | [Bun](https://bun.sh/) |
| リンター / フォーマッター | Biome（ESLint・Prettier は使わない） |
| API クライアント生成 | orval（OpenAPI → SWR フック + Zod スキーマ） |

### ローカル開発（Docker なし）

#### 前提条件

- [Bun](https://bun.sh/) がインストールされていること

```bash
curl -fsSL https://bun.sh/install | bash
```

#### 起動

```bash
cd frontend
bun install
bun run dev   # http://localhost:3000
```

### Docker 開発環境

バックエンドと同時に起動できます。

```bash
docker compose -f docker-compose.dev.yml up
```

#### 構成

| 項目 | 内容 |
|------|------|
| ベースイメージ | `oven/bun:1` |
| 起動コマンド | `bun run dev` |
| ポート | `3000` |
| ホットリロード | ソースを `/app` にマウントして有効 |

`./frontend` はコンテナ内の `/app` にマウントされます。`node_modules` は `frontend-node-modules` 名前付きボリュームで管理されるため、ホストのマウントで上書きされません。

> **初回起動時**: イメージビルド時に `bun install` が実行されます。`package.json` を変更した場合は `docker compose build frontend` で再ビルドしてください。

### Docker 本番環境

```bash
docker compose -f docker-compose.prod.yml up -d
```

API の向き先は **ビルド時** に埋め込まれます。環境に合わせて `NEXT_PUBLIC_API_URL` を指定してください。

```bash
NEXT_PUBLIC_API_URL=https://api.example.com docker compose -f docker-compose.prod.yml up -d
```

#### 構成

| 項目 | 内容 |
|------|------|
| ビルド | マルチステージ（builder → node:22-alpine） |
| 出力モード | `standalone`（最小イメージ） |
| 起動コマンド | `node server.js` |
| ポート | `3000` |
| 再起動ポリシー | `unless-stopped` |

### 環境変数

| 変数名 | デフォルト | 説明 |
|--------|-----------|------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | バックエンド API のベース URL |

ローカルで向き先を変えたい場合は `frontend/.env.local` に記述します（Git 管理外）。

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://api.example.com
```

> **注意**: `NEXT_PUBLIC_*` 変数は **ビルド時** にバンドルへ埋め込まれます。Docker 本番イメージをビルドする際は `docker compose build` の前に環境変数をセットしてください。

### コマンド一覧

```bash
cd frontend

bun run dev       # 開発サーバー起動 (http://localhost:3000)
bun run build     # 本番ビルド
bun run start     # ビルド済みアプリを起動
bun run lint      # Biome リントチェック
bun run format    # Biome フォーマット（ファイル書き換え）
bun run generate  # OpenAPI → API クライアント自動生成（バックエンド起動が必要）
```

### API クライアント生成

バックエンドの API が変更されたら `bun run generate` でクライアントを再生成します。詳細は [codegen.md](./codegen.md) を参照してください。

```bash
# 1. バックエンドを起動
docker compose -f docker-compose.dev.yml up

# 2. 別ターミナルで生成
cd frontend
bun run generate
```

生成されたファイル（`src/api/generated/`・`src/api/model/`・`src/api/zod.generated.ts`）は手動編集禁止です。

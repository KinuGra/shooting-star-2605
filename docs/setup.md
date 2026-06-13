# バックエンド セットアップガイド

## 前提条件

- Docker / Docker Compose がインストールされていること

---

## 開発環境

### 起動

```bash
docker compose -f docker-compose.dev.yml up
```

### 構成

| 項目 | 内容 |
|------|------|
| ベースイメージ | `gradle:8.8-jdk21-alpine` |
| 起動コマンド | `gradle bootRun` |
| ポート | `8080` |
| Spring Profile | `dev` |

ソースコード (`./backend`) はコンテナ内の `/app` にマウントされます。

### ホットリロード（IntelliJ IDEA）

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

---

## 本番環境

### 起動

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 構成

| 項目 | 内容 |
|------|------|
| ビルド | マルチステージビルドで実行可能 JAR を生成 |
| ベースイメージ | `eclipse-temurin:21-jre-alpine` |
| ポート | `8080` |
| Spring Profile | `prod` |
| 再起動ポリシー | `unless-stopped` |

ソースのマウントはなく、コンテナ内にビルド済み JAR が含まれます。

---

## OpenAPI / Swagger

開発環境起動後、以下の URL にアクセスできます。

| URL | 内容 |
|-----|------|
| `http://localhost:8080/swagger-ui.html` | Swagger UI（ブラウザで操作可能なAPI一覧） |
| `http://localhost:8080/api-docs` | OpenAPI 仕様（JSON形式） |

### アノテーション

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

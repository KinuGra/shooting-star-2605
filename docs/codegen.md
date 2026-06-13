# コード生成ガイド（orval / SWR）

バックエンドの OpenAPI スペックから、フロントエンド用の SWR フックと Zod スキーマを自動生成します。

---

## 前提条件

- バックエンドが起動していること（`http://localhost:8080/api-docs` にアクセスできる状態）
- フロントエンドの依存パッケージがインストール済みであること

```bash
cd frontend
bun install
```

---

## 生成コマンド

```bash
cd frontend
bun run generate
```

---

## 生成物

| 出力先 | 内容 |
|--------|------|
| `src/api/generated/` | SWR フック（API タグごとにファイル分割） |
| `src/api/model/` | リクエスト・レスポンスの型定義 |
| `src/api/zod.generated.ts` | Zod バリデーションスキーマ |

---

## 使い方

生成された SWR フックをコンポーネントからそのままインポートして使います。

```tsx
import { useGetSubmissions } from '@/api/generated/submissions';

export default function Page() {
  const { data, error, isLoading } = useGetSubmissions();
  // ...
}
```

---

## 環境変数

| 変数名 | デフォルト | 説明 |
|--------|-----------|------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | API のベース URL |

本番環境など向け先を変えたい場合は `.env.local` に設定します。

```bash
NEXT_PUBLIC_API_URL=https://api.example.com
```

---

## 設定ファイル

`frontend/orval.config.ts` で生成の挙動を管理しています。

- **入力**: `http://localhost:8080/api-docs`（OpenAPI JSON）
- **SWR フック出力**: `src/api/generated/`（`tags-split` モード）
- **Zod スキーマ出力**: `src/api/zod.generated.ts`
- **カスタム fetcher**: `src/api/fetcher.ts` の `customFetch`

---

## 注意事項

- 生成物（`src/api/generated/`・`src/api/model/`・`src/api/zod.generated.ts`）は手動で編集しないでください。バックエンドの API 変更後は `bun run generate` を再実行してください。
- バックエンドが起動していない状態で実行するとエラーになります。

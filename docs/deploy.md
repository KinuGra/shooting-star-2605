# デプロイ手順

AWS ECS Fargate + RDS PostgreSQL へのデプロイ手順。

## 前提条件

- AWS CLI インストール済み・認証済み (`aws configure`)
- Docker インストール済み・起動済み
- Terraform >= 1.0 インストール済み
- `make` コマンドが使えること

## クイックスタート（更新デプロイ）

```bash
# バックエンド・フロントエンド両方を更新
make deploy

# バックエンドのみ更新
make deploy-backend

# フロントエンドのみ更新
make deploy-frontend

# 現在の公開 IP を確認
make ip
```

---

## 初回セットアップ

### 1. AWS 認証

```bash
aws configure
# AWS Access Key ID, Secret Access Key, Region (ap-northeast-1), Output format (json) を入力
```

### 2. tfvars を設定

```bash
cp infra/terraform.tfvars.example infra/terraform.tfvars
```

`infra/terraform.tfvars` を編集し、以下の値を埋める（`terraform.tfvars` は `.gitignore` 済み）：

```hcl
aws_region     = "ap-northeast-1"
project_name   = "shooting-star"

# ECR URI は手順 4 のあとで確認できる（初回は dummy でも可）
backend_image  = "<ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com/shooting-star-backend:latest"
frontend_image = "<ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com/shooting-star-frontend:latest"

# RDS PostgreSQL
db_instance_class = "db.t3.micro"
db_username       = "shootingstar"
db_password       = "<強力なパスワード>"

# JWT (64文字以上のランダム文字列)
jwt_secret = "<64文字以上のランダム文字列>"
```

JWT シークレットの生成例：

```bash
openssl rand -hex 64
```

### 3. Terraform 初期化 & ECR インポート

```bash
make init

# ECR リポジトリが手動作成済みの場合はインポート
cd infra
export TF_VAR_backend_image="dummy"
export TF_VAR_frontend_image="dummy"
export TF_VAR_db_password="dummy"
export TF_VAR_jwt_secret="dummy-jwt-secret-that-is-at-least-64-characters-long-for-validation"
terraform import aws_ecr_repository.backend shooting-star-backend
terraform import aws_ecr_repository.frontend shooting-star-frontend
cd ..
```

> **注意**: `terraform state list` で既にインポート済みの場合はスキップ。

### 4. 初回フルデプロイ

```bash
make deploy
```

`make deploy` は以下を順番に実行する：

1. ECR ログイン
2. バックエンド Docker イメージをビルドして ECR へプッシュ
3. フロントエンド Docker イメージをビルドして ECR へプッシュ
4. `terraform apply`（RDS 作成・ECS タスク定義更新・SSM パラメータ登録）
5. ECS サービスが安定するまで待機（RDS 初回作成時は数分かかる）
6. 公開 IP を表示

---

## インフラ構成

| リソース | 種別 | 用途 |
|---------|------|------|
| VPC | `10.0.0.0/16` | 全リソースの共通ネットワーク |
| Public Subnet | `10.0.1.0/24` (ap-northeast-1a) | ECS Fargate タスク |
| Private Subnet 1 | `10.0.2.0/24` (ap-northeast-1a) | RDS（プライマリ） |
| Private Subnet 2 | `10.0.3.0/24` (ap-northeast-1c) | RDS（DB サブネットグループ用） |
| ECR | backend / frontend | コンテナイメージ保管 |
| ECS Fargate | 1 タスク | バックエンド + フロントエンド |
| RDS PostgreSQL 16 | `db.t3.micro` | アプリケーション DB |
| SSM Parameter Store | SecureString | DB パスワード・JWT シークレット |
| CloudWatch Logs | backend / frontend | コンテナログ |

### シークレット管理

DB パスワードと JWT シークレットは AWS SSM Parameter Store (SecureString) に保存され、ECS タスク起動時に環境変数として注入される（`SPRING_DATASOURCE_PASSWORD`, `JWT_SECRET`）。

---

## Terraform インフラのみ更新

コードは変更せずインフラだけ変えたい場合：

```bash
make plan    # 変更内容を確認
cd infra && terraform apply
```

---

## トラブルシューティング

### RDS に接続できない

- ECS タスクと RDS が同じ VPC にいるか確認
- RDS セキュリティグループが ECS セキュリティグループからの 5432 を許可しているか確認
- `terraform output rds_endpoint` でエンドポイントを確認

### ECS タスクが起動しない

```bash
# タスクの停止理由を確認
aws ecs describe-tasks \
  --cluster shooting-star-cluster \
  --tasks $(aws ecs list-tasks --cluster shooting-star-cluster \
    --service-name shooting-star-service --query 'taskArns[0]' --output text) \
  --query 'tasks[0].stoppedReason'
```

### 現在の公開 IP を確認

```bash
make ip
```

---

## アーキテクチャ上の制限事項

| 項目 | 現状 | 将来の改善案 |
|------|------|-------------|
| IP 固定 | タスク再起動で変わる | ALB を追加 |
| バックエンド公開 | `:8080` がインターネット全公開 | ALB 経由にしてバックエンドをプライベート化 |
| HTTPS | 非対応 | ACM + ALB で対応 |
| RDS 冗長化 | シングル AZ | `multi_az = true` に変更 |

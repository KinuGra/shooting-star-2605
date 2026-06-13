# デプロイ手順

AWS ECS Fargate へのデプロイ手順。初回セットアップと更新デプロイの両方をカバーする。

## 前提条件

- AWS CLI インストール済み・認証済み (`aws configure`)
- Docker インストール済み・起動済み
- Terraform >= 1.0 インストール済み
- プロジェクトルートにいること

## 初回セットアップ

### 1. AWS 認証

```bash
aws configure
# AWS Access Key ID, Secret Access Key, Region (ap-northeast-1), Output format (json) を入力
```

### 2. 環境変数を設定

```bash
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=ap-northeast-1
```

### 3. Terraform 初期化 & 既存 ECR をインポート

ECR リポジトリはすでに手動作成済みのためインポートする。

```bash
cd infra
terraform init

# ダミーイメージで変数を満たしてからインポート
export TF_VAR_backend_image="dummy"
export TF_VAR_frontend_image="dummy"
terraform import aws_ecr_repository.backend shooting-star-backend
terraform import aws_ecr_repository.frontend shooting-star-frontend

cd ..
```

> **注意**: すでに `terraform state` にある場合は import がエラーになる。
> `terraform state list` で確認し、あればスキップする。

### 4. Docker イメージをビルド & ECR にプッシュ

```bash
# ECR ログイン
aws ecr get-login-password --region $AWS_REGION \
  | docker login --username AWS --password-stdin \
    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# バックエンド
docker build -f docker/backend/Dockerfile --target prod -t shooting-star-backend .
docker tag shooting-star-backend:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/shooting-star-backend:latest
docker push \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/shooting-star-backend:latest

# フロントエンド
docker build -f docker/frontend/Dockerfile --target prod -t shooting-star-frontend .
docker tag shooting-star-frontend:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/shooting-star-frontend:latest
docker push \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/shooting-star-frontend:latest
```

### 5. Terraform でインフラをデプロイ

```bash
cd infra

cat > terraform.tfvars <<EOF
aws_region     = "ap-northeast-1"
project_name   = "shooting-star"
backend_image  = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shooting-star-backend:latest"
frontend_image = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shooting-star-frontend:latest"
EOF

terraform apply

cd ..
```

### 6. サービス安定化を待ってアクセス先 IP を取得

```bash
# タスクが RUNNING になるまで待機（タイムアウト: 10 分）
aws ecs wait services-stable \
  --cluster shooting-star-cluster \
  --services shooting-star-service \
  --region $AWS_REGION

# タスクの ENI から パブリック IP を取得
TASK_ARN=$(aws ecs list-tasks \
  --cluster shooting-star-cluster \
  --service-name shooting-star-service \
  --region $AWS_REGION \
  --query 'taskArns[0]' \
  --output text)

ENI_ID=$(aws ecs describe-tasks \
  --cluster shooting-star-cluster \
  --tasks "$TASK_ARN" \
  --region $AWS_REGION \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
  --output text)

PUBLIC_IP=$(aws ec2 describe-network-interfaces \
  --network-interface-ids "$ENI_ID" \
  --region $AWS_REGION \
  --query 'NetworkInterfaces[0].Association.PublicIp' \
  --output text)

echo "Frontend: http://${PUBLIC_IP}:3000"
echo "Backend:  http://${PUBLIC_IP}:8080"
echo "Swagger:  http://${PUBLIC_IP}:8080/swagger-ui.html"
```

---

## イメージ更新デプロイ

コードを変更してデプロイし直す場合。プロジェクトルートから実行すること。

```bash
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=ap-northeast-1

aws ecr get-login-password --region $AWS_REGION \
  | docker login --username AWS --password-stdin \
    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Backend 更新時
docker build -f docker/backend/Dockerfile --target prod -t shooting-star-backend .
docker tag shooting-star-backend:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/shooting-star-backend:latest
docker push \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/shooting-star-backend:latest

# Frontend 更新時
docker build -f docker/frontend/Dockerfile --target prod -t shooting-star-frontend .
docker tag shooting-star-frontend:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/shooting-star-frontend:latest
docker push \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/shooting-star-frontend:latest

# ECS サービスを強制更新（新イメージで再起動）
aws ecs update-service \
  --cluster shooting-star-cluster \
  --service shooting-star-service \
  --force-new-deployment \
  --region $AWS_REGION

# 安定化を待って IP 再取得
aws ecs wait services-stable \
  --cluster shooting-star-cluster \
  --services shooting-star-service \
  --region $AWS_REGION

TASK_ARN=$(aws ecs list-tasks \
  --cluster shooting-star-cluster \
  --service-name shooting-star-service \
  --region $AWS_REGION \
  --query 'taskArns[0]' \
  --output text)

ENI_ID=$(aws ecs describe-tasks \
  --cluster shooting-star-cluster \
  --tasks "$TASK_ARN" \
  --region $AWS_REGION \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
  --output text)

PUBLIC_IP=$(aws ec2 describe-network-interfaces \
  --network-interface-ids "$ENI_ID" \
  --region $AWS_REGION \
  --query 'NetworkInterfaces[0].Association.PublicIp' \
  --output text)

echo "Frontend: http://${PUBLIC_IP}:3000"
echo "Backend:  http://${PUBLIC_IP}:8080"
echo "Swagger:  http://${PUBLIC_IP}:8080/swagger-ui.html"
```

> **注意**: ALB がないため、タスク再起動のたびにパブリック IP が変わる。

---

## アーキテクチャ上の制限事項

| 項目 | 現状 | 将来の改善案 |
|------|------|-------------|
| IP 固定 | タスク再起動で変わる | ALB を追加 |
| バックエンド公開 | `:8080` がインターネット全公開 | ALB 経由にしてバックエンドをプライベート化 |
| HTTPS | 非対応 | ACM + ALB で対応 |

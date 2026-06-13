# ECS Terraform Configuration

このディレクトリには、ハッカソン用の超ミニマルECS構成のTerraformコードが含まれています。

## 構成

- **ALBなし**: ECSタスクに直接Public IPでアクセス
- **NATなし**: Public Subnet配置でコスト削減
- **RDSなし**: PostgreSQLコンテナをタスク内に配置
- **マルチコンテナタスク**: Frontend + Backend + PostgreSQL

## 前提条件

- AWS CLI設定済み
- Terraform 1.5.0以上インストール済み
- Docker Desktopインストール済み
- ECRにプッシュするイメージがビルド済み

## デプロイ手順

### 1. ECRリポジトリ作成

```bash
cd infra/ecs
terraform init
terraform apply -target=aws_ecr_repository.backend -target=aws_ecr_repository.frontend
```

出力されたECR URLをメモしてください。

### 2. Dockerイメージビルド＆プッシュ

プロジェクトルートに移動:

```bash
cd ../../
```

ECRログイン:

```bash
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com
```

Backend ビルド＆プッシュ:

```bash
docker build -f docker/backend/Dockerfile --target prod -t shooting-star-backend:latest .
docker tag shooting-star-backend:latest <ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com/shooting-star-backend:latest
docker push <ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com/shooting-star-backend:latest
```

Frontend ビルド＆プッシュ:

```bash
docker build -f docker/frontend/Dockerfile --target prod -t shooting-star-frontend:latest .
docker tag shooting-star-frontend:latest <ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com/shooting-star-frontend:latest
docker push <ACCOUNT_ID>.dkr.ecr.ap-northeast-1.amazonaws.com/shooting-star-frontend:latest
```

### 3. インフラ全体デプロイ

```bash
cd infra/ecs
terraform apply
```

### 4. ECS Task Public IP取得

```bash
# タスクARN取得
aws ecs list-tasks --cluster shooting-star-cluster --region ap-northeast-1

# タスク詳細からPublic IP取得（長いコマンド）
aws ecs describe-tasks \
  --cluster shooting-star-cluster \
  --tasks <TASK_ARN> \
  --region ap-northeast-1 \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
  --output text | xargs -I {} aws ec2 describe-network-interfaces \
  --network-interface-ids {} \
  --region ap-northeast-1 \
  --query 'NetworkInterfaces[0].Association.PublicIp' \
  --output text
```

または、AWS Consoleから:
1. ECS > Clusters > shooting-star-cluster
2. Tasks タブ
3. Running中のタスクをクリック
4. Networkセクションで Public IP確認

### 5. アクセス確認

```bash
export ECS_IP=<PUBLIC_IP>

# フロントエンド
curl http://$ECS_IP/

# バックエンド
curl http://$ECS_IP/api/health

# Swagger UI（ブラウザで）
open http://$ECS_IP/api/swagger-ui.html
```

## リソース削除

```bash
terraform destroy
```

## コスト

- 月額: 約$17
- 2日間: 約$3.30

## 注意事項

- データ永続化なし（タスク再起動でDB消失）
- スケーリング不可（タスク数1固定）
- HTTPのみ（HTTPSなし）
- ハッカソン専用構成（本番環境では使用不可）

## トラブルシューティング

### ECSタスクが起動しない

```bash
aws ecs describe-tasks --cluster shooting-star-cluster --tasks <TASK_ARN> --region ap-northeast-1
```

### CloudWatch Logsを確認

```bash
aws logs tail /ecs/shooting-star-backend --follow
aws logs tail /ecs/shooting-star-frontend --follow
aws logs tail /ecs/shooting-star-postgres --follow
```

### ECRからイメージがpullできない

- Public IP割り当てが有効か確認
- Security Groupで443/tcpが許可されているか確認
- IAM Task Execution Roleを確認

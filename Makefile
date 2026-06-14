AWS_REGION    ?= ap-northeast-1
AWS_ACCOUNT_ID ?= $(shell aws sts get-caller-identity --query Account --output text)
ECR_BASE      := $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com
BACKEND_IMAGE := $(ECR_BASE)/shooting-star-backend:latest
FRONTEND_IMAGE := $(ECR_BASE)/shooting-star-frontend:latest
CLUSTER       := shooting-star-cluster
SERVICE       := shooting-star-service

.PHONY: help init plan deploy deploy-backend deploy-frontend ip ecr-login \
        _build-push-backend _build-push-frontend _tf-apply _ecs-force-update _wait-stable

help:
	@echo "Usage:"
	@echo "  make init              Terraform init (run once)"
	@echo "  make plan              Terraform plan (preview changes)"
	@echo "  make deploy            Build & push both images, then terraform apply"
	@echo "  make deploy-backend    Build & push backend only, force ECS update"
	@echo "  make deploy-frontend   Build & push frontend only, force ECS update"
	@echo "  make ip                Show current ECS task public IP"

# ── ECR login ───────────────────────────────────────────────────────────────

ecr-login:
	aws ecr get-login-password --region $(AWS_REGION) \
	  | docker login --username AWS --password-stdin $(ECR_BASE)

# ── Terraform ───────────────────────────────────────────────────────────────

init:
	cd infra && terraform init

plan:
	cd infra && terraform plan

_tf-apply:
	cd infra && terraform apply -auto-approve

# ── Docker build & push ─────────────────────────────────────────────────────

_build-push-backend:
	docker build -f docker/backend/Dockerfile --target prod -t shooting-star-backend .
	docker tag shooting-star-backend:latest $(BACKEND_IMAGE)
	docker push $(BACKEND_IMAGE)

_build-push-frontend:
	docker build -f docker/frontend/Dockerfile --target prod -t shooting-star-frontend .
	docker tag shooting-star-frontend:latest $(FRONTEND_IMAGE)
	docker push $(FRONTEND_IMAGE)

# ── ECS helpers ─────────────────────────────────────────────────────────────

_ecs-force-update:
	aws ecs update-service \
	  --cluster $(CLUSTER) \
	  --service $(SERVICE) \
	  --force-new-deployment \
	  --region $(AWS_REGION)

_wait-stable:
	aws ecs wait services-stable \
	  --cluster $(CLUSTER) \
	  --services $(SERVICE) \
	  --region $(AWS_REGION)

# ── High-level targets ──────────────────────────────────────────────────────

deploy: ecr-login _build-push-backend _build-push-frontend _tf-apply _wait-stable ip

deploy-backend: ecr-login _build-push-backend _ecs-force-update _wait-stable ip

deploy-frontend: ecr-login _build-push-frontend _ecs-force-update _wait-stable ip

ip:
	@TASK_ARN=$$(aws ecs list-tasks \
	    --cluster $(CLUSTER) \
	    --service-name $(SERVICE) \
	    --region $(AWS_REGION) \
	    --query 'taskArns[0]' \
	    --output text) && \
	ENI_ID=$$(aws ecs describe-tasks \
	    --cluster $(CLUSTER) \
	    --tasks $$TASK_ARN \
	    --region $(AWS_REGION) \
	    --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
	    --output text) && \
	PUBLIC_IP=$$(aws ec2 describe-network-interfaces \
	    --network-interface-ids $$ENI_ID \
	    --region $(AWS_REGION) \
	    --query 'NetworkInterfaces[0].Association.PublicIp' \
	    --output text) && \
	echo "Frontend: http://$$PUBLIC_IP:3000" && \
	echo "Backend:  http://$$PUBLIC_IP:8080" && \
	echo "Swagger:  http://$$PUBLIC_IP:8080/swagger-ui.html"

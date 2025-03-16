# Makefile for AWS SAM template deployment
STACK_NAME := mortgage-simulator
AWS_REGION := eu-west-1
CAPABILITIES := CAPABILITY_IAM
TEMPLATE_PATH := infra/template.yaml
FRONTEND_BUCKET_NAME := mortgage-simulator-websitebucket-h1lej1q9plc5

.PHONY: build deploy guided-deploy invoke delete help frontend-build s3-deploy deploy-frontend

help:
	@echo "Available targets:"
	@echo "  build       : Compile SAM application from $(TEMPLATE_PATH)"
	@echo "  deploy      : Deploy from $(TEMPLATE_PATH)"
	@echo "  guided-deploy: Interactive deployment"
	@echo "  invoke      : Test Lambda function"
	@echo "  delete      : Remove stack"
	@echo "  frontend-build: Build Next.js application"
	@echo "  s3-deploy: Deploy to S3 bucket"
	@echo "  deploy-frontend: Combined build and deploy command"

build:
	cd backend && poetry install && poetry build-lambda docker-image=public.ecr.aws/sam/build-python3.12:latest-x86_64
	sam build -t $(TEMPLATE_PATH)

deploy: build	
	sam deploy --template-file $(TEMPLATE_PATH) \
		--stack-name $(STACK_NAME) \
		--region $(AWS_REGION) \
		--capabilities $(CAPABILITIES)

guided-deploy: build
	sam deploy --guided --template-file $(TEMPLATE_PATH) \
		--stack-name $(STACK_NAME) \
		--region $(AWS_REGION) \
		--capabilities $(CAPABILITIES)

invoke:
	sam local invoke -t $(TEMPLATE_PATH)

delete:
	aws cloudformation delete-stack \
		--stack-name $(STACK_NAME) \
		--region $(AWS_REGION)

# Next.js frontend commands
frontend-build:
	cd frontend && npm run build

# No need for separate export command as it happens during build
s3-deploy:
	aws s3 sync frontend/out/ s3://$(FRONTEND_BUCKET_NAME)/ --delete

# Combined build and deploy command
deploy-frontend: frontend-build s3-deploy
	@echo "Frontend successfully built and deployed to S3"
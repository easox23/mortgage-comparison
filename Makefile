# Makefile for AWS SAM template deployment
STACK_NAME := mortgage-simulator
AWS_REGION := eu-west-1
CAPABILITIES := CAPABILITY_IAM
TEMPLATE_PATH := infra/template.yaml

.PHONY: build deploy guided-deploy invoke delete help

help:
	@echo "Available targets:"
	@echo "  build       : Compile SAM application from $(TEMPLATE_PATH)"
	@echo "  deploy      : Deploy from $(TEMPLATE_PATH)"
	@echo "  guided-deploy: Interactive deployment"
	@echo "  invoke      : Test Lambda function"
	@echo "  delete      : Remove stack"

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
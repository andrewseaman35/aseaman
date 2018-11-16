export
ROOT := $(shell pwd)

DEPLOY_PARAMETERS:=ParameterKey=LambdaFunctionName,ParameterValue="$(LAMBDA_FUNCTION_NAME)" \
	ParameterKey=DeployEnv,ParameterValue="$(DEPLOY_ENV)" \
	ParameterKey=Branch,ParameterValue="$(BRANCH)"

package:
	make -C lambdas package

deploy:
	make -C lambdas upload
	aws cloudformation create-stack \
		--template-body file://$(ROOT)/stacks/api-stack.yml \
		--stack-name $(STACK_NAME) \
		--parameters $(DEPLOY_PARAMETERS) \
		--capabilities CAPABILITY_IAM \
		--region=us-east-1
	aws cloudformation wait stack-create-complete \
		--stack-name $(STACK_NAME) \
		--region=us-east-1

clean:
	make -C lambdas clean

.PHONY: package deploy clean

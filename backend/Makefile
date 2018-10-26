ROOT := $(shell pwd)
NONCE  := $(shell date +%s)
STACK_NAME := "stack-${NONCE}"

DEPLOY_PARAMETERS:=ParameterKey=LambdaFunctionName,ParameterValue="lambda_api_${NONCE}"
package:
	make -C lambdas package

deploy:
	make -C lambdas upload
	(aws cloudformation create-stack \
		--template-body file://${ROOT}/stacks/api-stack.yml \
		--stack-name ${STACK_NAME} \
		--parameters $(DEPLOY_PARAMETERS) \
		--capabilities CAPABILITY_IAM \
		--region=us-east-1) || \
	(aws cloudformation describe-stack-events \
		--stack-name ${STACK_NAME} \
		--region=us-east-1 && exit 1)

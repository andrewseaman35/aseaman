RANDOM := $(shell bash -c 'echo $$RANDOM')
STACK_NAME := "stack-${RANDOM}"

deploy:
	make -C lambdas deploy
	aws cloudformation deploy --template-file stacks/api-stack.yml --stack-name ${STACK_NAME} --capabilities CAPABILITY_IAM

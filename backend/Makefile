export
ROOT := $(shell pwd)

DEPLOY_PARAMETERS:= \
	ParameterKey=ApiUrl,ParameterValue="$(API_URL)" \
	ParameterKey=StateApiName,ParameterValue="$(STATE_API_NAME)" \
	ParameterKey=DeployEnv,ParameterValue="$(DEPLOY_ENV)" \
	ParameterKey=Branch,ParameterValue="$(BRANCH)" \
	ParameterKey=WhiskyApiName,ParameterValue="$(WHISKY_API_NAME)" \
	ParameterKey=DrawJasperApiName,ParameterValue="$(DRAW_JASPER_API_NAME)" \
	ParameterKey=SaltLevelApiName,ParameterValue="$(SALT_LEVEL_API_NAME)" \
	ParameterKey=CompareACNHApiName,ParameterValue="$(COMPARE_ACNH_API_NAME)" \
	ParameterKey=MameHighscoreApiName,ParameterValue="$(MAME_HIGHSCORE_API_NAME)" \
	ParameterKey=HostedZoneId,ParameterValue="$(HOSTED_ZONE_ID)" \
	ParameterKey=ApiCertificateId,ParameterValue="$(API_CERTIFICATE_ID)"

package:
	make -C api package

validate:
	aws cloudformation validate-template \
		--template-body file://$(ROOT)/stacks/api-stack.yml

deploy: validate
	make -C api upload
	aws cloudformation create-stack \
		--template-body file://$(ROOT)/stacks/api-stack.yml \
		--stack-name $(STACKNAME) \
		--parameters $(DEPLOY_PARAMETERS) \
		--capabilities CAPABILITY_IAM \
		--region=us-east-1
	aws cloudformation wait stack-create-complete \
		--stack-name $(STACKNAME) \
		--region=us-east-1

clean:
	make -C api clean

.PHONY: package deploy clean

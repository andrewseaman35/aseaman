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
	ParameterKey=ChessApiName,ParameterValue="$(CHESS_API_NAME)" \
	ParameterKey=HostedZoneId,ParameterValue="$(HOSTED_ZONE_ID)" \
	ParameterKey=ApiCertificateId,ParameterValue="$(API_CERTIFICATE_ID)"

API_CERTIFICATE_ID := 5af2f809-2459-4293-ae2d-d611ae4045bd
HOSTED_ZONE_ID := Z1NTL75ESDHPUU
API_URL := test-api.test.andrewcseaman.com
DEPLOY_ENV ?= dev
# NONCE ?= 1619239047
NONCE ?= $(shell date +%s)

package:
	make -C api package

upload:
	make -C api upload

tfplan: #package
	cd deployments/stage && terraform plan \
		-out=terraform.tfplan \
		-var='nonce=$(NONCE)' 
	# cd deployments/stage && terraform apply terraform.tfplan 

tfapply:
	cd deployments/stage && terraform apply terraform.tfplan 

validate:
	aws cloudformation validate-template \
		--template-body file://$(ROOT)/stacks/api-stack.yml \
		--region=us-east-1

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

export
NONCE  := $(shell date +%s)
BRANCH ?= manual
DEPLOY_ENV ?= test
STACK_NAME := stack-$(DEPLOY_ENV)-$(NONCE)
LAMBDA_FUNCTION_NAME = lambda-api-$(DEPLOY_ENV)-$(NONCE)

package:
	make -C backend package

deploy_api:
	make -C backend deploy

deploy_website:
	aws s3 cp --recursive website s3://aseaman-website-$(DEPLOY_ENV)

deploy: deploy_api deploy_website

clean:
	make -C backend clean

.PHONY: package deploy clean

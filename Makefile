export
ROOTDIR := $(shell pwd)
VENV_PYTHON := venv/bin/python

NONCE ?= $(shell date +%s)
BRANCH ?= manual
DEPLOY_ENV ?= test
STACKNAME ?= stack-$(DEPLOY_ENV)-$(NONCE)
LAMBDA_FUNCTION_NAME ?= lambda-api-$(DEPLOY_ENV)-$(NONCE)

venv: requirements.txt
	virtualenv venv --python=python3
	venv/bin/pip install -r requirements.txt

website/js/config/config.js: venv config/web_template.json scripts/generate_config.py
	$(VENV_PYTHON) scripts/generate_config.py

website: website/js/config/config.js

package:
	make -C backend package

deploy_api:
	make -C backend deploy

deploy_website: website
	aws s3 rm s3://$(DEPLOY_ENV).andrewcseaman.com --recursive
	aws s3 cp --recursive website s3://$(DEPLOY_ENV).andrewcseaman.com

deploy_test_website: website
	aws s3 rm s3://test.andrewcseaman.com/$(BRANCH) --recursive
	aws s3 cp --recursive website s3://test.andrewcseaman.com/$(BRANCH)
	aws s3 cp --recursive testing_website s3://test.andrewcseaman.com

deploy: deploy_api deploy_website

deploy_test: deploy_api deploy_test_website

remove_old_stacks: venv
	$(VENV_PYTHON) scripts/remove_old_stacks.py

clean:
	rm -rf venv
	rm -f website/config/config.js
	make -C backend clean

.PHONY: package deploy_api deploy_website deploy_test_website deploy deploy_test remove_old_stacks clean

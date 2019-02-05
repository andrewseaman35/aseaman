export
ROOTDIR := $(shell pwd)
VENV_PYTHON := venv/bin/python

NONCE ?= $(shell date +%s)
BRANCH ?= manual
DEPLOY_ENV ?= test
STACKNAME ?= stack-$(DEPLOY_ENV)-$(NONCE)
LAMBDA_FUNCTION_NAME ?= lambda-api-$(DEPLOY_ENV)-$(NONCE)

LOCAL_PORT := 8123

website/node_modules: website/package.json website/package-lock.json
	npm -g install ./website/ --save-dev

js: website/node_modules
	browserify website/js/src/main.js -o website/js/bundle.js -d

venv: requirements.txt
	virtualenv venv --python=python3
	venv/bin/pip install -r requirements.txt

static: venv js
	$(VENV_PYTHON) scripts/compile_html.py

local_config: venv config/web_template.json scripts/generate_config.py
	$(VENV_PYTHON) scripts/generate_config.py --local

website/js/config/config.js: venv config/web_template.json scripts/generate_config.py
	$(VENV_PYTHON) scripts/generate_config.py --root-dir=${ROOTDIR} --stack-name=${STACKNAME} --deploy-env=${DEPLOY_ENV}

website: website/js/config/config.js static

package:
	make -C backend package

deploy_api:
	make -C backend deploy

deploy_website: website
	aws s3 rm s3://$(DEPLOY_ENV).andrewcseaman.com --recursive
	aws s3 cp --recursive --exclude=website/js/src/* website s3://$(DEPLOY_ENV).andrewcseaman.com

deploy_test_website: website
	aws s3 rm s3://test.andrewcseaman.com/$(BRANCH) --recursive
	aws s3 cp --recursive website s3://test.andrewcseaman.com/$(BRANCH)
	aws s3 cp --recursive testing_website s3://test.andrewcseaman.com

deploy: deploy_api deploy_website

deploy_test: deploy_api deploy_test_website

remove_old_stacks: venv
	$(VENV_PYTHON) scripts/remove_old_stacks.py --stack-name=${STACKNAME} --deploy-env=${DEPLOY_ENV} --branch=${BRANCH}

clean:
	rm -rf venv
	rm -f website/js/src/config.js
	rm website/js/bundle.js
	rm -f website/*.html
	rm -rf website/node_modules
	make -C backend clean

start_local: local_config static
	cd website && python3 -m http.server $(LOCAL_PORT)

.PHONY: package deploy_api deploy_website deploy_test_website deploy deploy_test remove_old_stacks clean static js

export
ROOTDIR := $(shell pwd)
VENV_PYTHON := venv/bin/python

NONCE ?= $(shell date +%s)
BRANCH ?= manual
DEPLOY_ENV ?= test
STACKNAME ?= stack-$(DEPLOY_ENV)-$(NONCE)

LOCAL_TESTING_PORT := 8124
LOCAL_PORT := 8123

venv: requirements.txt
	virtualenv venv --python=python3
	venv/bin/pip install -r requirements.txt

package:
	make -C backend package

website: venv
	make -C website

deploy_api:
	make -C backend deploy

deploy_website: website
	echo "Updating website S3 files"
	aws s3 rm s3://$(DEPLOY_ENV).andrewcseaman.com --recursive > /dev/null
	aws s3 cp --recursive --exclude=website/js/src/* website/public/ s3://$(DEPLOY_ENV).andrewcseaman.com > /dev/null

deploy_test_website: website
	echo "Updating test website S3 files"
	aws s3 rm s3://test.andrewcseaman.com/$(BRANCH) --recursive > /dev/null
	aws s3 cp --recursive website/public/ s3://test.andrewcseaman.com/sandboxes/$(BRANCH) > /dev/null
	aws s3 cp --recursive testing_website s3://test.andrewcseaman.com > /dev/null

deploy: deploy_api deploy_website

deploy_test: deploy_api deploy_test_website

remove_old_stacks: venv
	$(VENV_PYTHON) scripts/remove_old_stacks.py --stack-name=${STACKNAME} --deploy-env=${DEPLOY_ENV} --branch=${BRANCH}

watch: venv
	$(VENV_PYTHON) scripts/run_watchers.py

start_local: venv
	make -C website local
	cd website/public/ && python3 -m http.server $(LOCAL_PORT)

start_local_test:
	cd testing_website && python3 -m http.server $(LOCAL_TESTING_PORT)

clean:
	rm -rf venv
	make -C backend clean
	make -C website clean

.PHONY: package deploy_api deploy_website deploy_test_website deploy deploy_test remove_old_stacks clean website

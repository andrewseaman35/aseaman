PACKAGE_DIR = packages

BUDGET_FILE_JOB_NAME := budget_file
SPLITOMATIC_JOB_NAME := splitomatic

deploy_venv: requirements.txt
	virtualenv deploy_venv --python=python3 --no-site-packages
	deploy_venv/bin/pip install -r requirements.txt

venv:
	virtualenv venv --python=python3

copy_aws_files:
	cp ../api/base/aws.py base/
	cp ../api/base/dynamodb.py base/
	cp ../api/base/s3.py base/
	cp ../api/base/helpers.py base/
	cp ../api/base/api_exceptions.py base/

package_dir:
	rm -rf $(PACKAGE_DIR)
	mkdir -p $(PACKAGE_DIR)

package: copy_aws_files package_dir
	echo "Packaging backend lambda functions jobs"
	pip install -r budget_file/requirements.txt -t $(PACKAGE_DIR)/$(BUDGET_FILE_JOB_NAME)
	cp -r budget_file/* $(PACKAGE_DIR)/$(BUDGET_FILE_JOB_NAME)
	cp -r base $(PACKAGE_DIR)/$(BUDGET_FILE_JOB_NAME)
	cd $(PACKAGE_DIR)/$(BUDGET_FILE_JOB_NAME) && zip -r ../$(BUDGET_FILE_JOB_NAME).zip * > /dev/null

	pip install -r splitomatic/requirements.txt -t $(PACKAGE_DIR)/$(SPLITOMATIC_JOB_NAME)
	cp -r splitomatic/* $(PACKAGE_DIR)/$(SPLITOMATIC_JOB_NAME)
	cp -r base $(PACKAGE_DIR)/$(SPLITOMATIC_JOB_NAME)
	cd $(PACKAGE_DIR)/$(SPLITOMATIC_JOB_NAME) && zip -r ../$(SPLITOMATIC_JOB_NAME).zip * > /dev/null

package_single: copy_aws_files
	@if [ "$(JOB)" = "" ]; then echo "JOB not set. Usage: make package_single JOB=<job_name>"; exit 2; fi
	rm -rf $(PACKAGE_DIR)/$(JOB) $(PACKAGE_DIR)/$(JOB).zip
	mkdir -p $(PACKAGE_DIR)/$(JOB)
	pip install -r $(JOB)/requirements.txt -t $(PACKAGE_DIR)/$(JOB)
	cp -r $(JOB)/* $(PACKAGE_DIR)/$(JOB)
	cp -r base $(PACKAGE_DIR)/$(JOB)
	cd $(PACKAGE_DIR)/$(JOB) && zip -r ../$(JOB).zip * > /dev/null

.PHONY: package_dir package copy_aws_files package_single
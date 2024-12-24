PACKAGE_DIR = packages

BUDGET_FILE_JOB_NAME := budget_file

deploy_venv: requirements.txt
	virtualenv deploy_venv --python=python3 --no-site-packages
	deploy_venv/bin/pip install -r requirements.txt

venv:
	virtualenv venv --python=python3

copy_aws_files:
	cp ../api/base/aws.py base/
	cp ../api/base/dynamodb.py base/
	cp ../api/base/s3.py base/

package_dir:
	rm -rf $(PACKAGE_DIR)
	mkdir -p $(PACKAGE_DIR)

package: venv package_dir
	echo "Packaging backend lambda functions jobs"
	venv/bin/pip install -r budget_file/requirements.txt -t $(PACKAGE_DIR)/$(BUDGET_FILE_JOB_NAME)
	cp -r budget_file/* $(PACKAGE_DIR)/$(BUDGET_FILE_JOB_NAME)
	cp -r base $(PACKAGE_DIR)/$(BUDGET_FILE_JOB_NAME)
	cd $(PACKAGE_DIR)/$(BUDGET_FILE_JOB_NAME) && zip -r ../$(BUDGET_FILE_JOB_NAME).zip * > /dev/null

.PHONY: package_dir package copy_aws_files
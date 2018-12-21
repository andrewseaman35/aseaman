PACKAGE_DIR = packages
DEPLOY_ENV ?= test
LAMBDA_FUNCTION_NAME ?= recipes

venv:
	virtualenv venv --python=python3

package_dir:
	mkdir -p $(PACKAGE_DIR)
	mkdir -p $(PACKAGE_DIR)/$(LAMBDA_FUNCTION_NAME)

package: package_dir venv
	venv/bin/pip install -r recipes/requirements.txt -t $(PACKAGE_DIR)/$(LAMBDA_FUNCTION_NAME)
	cp -r recipes/* $(PACKAGE_DIR)/$(LAMBDA_FUNCTION_NAME)
	cp -r base $(PACKAGE_DIR)/$(LAMBDA_FUNCTION_NAME)
	cd $(PACKAGE_DIR)/$(LAMBDA_FUNCTION_NAME) && zip -r ../$(LAMBDA_FUNCTION_NAME).zip *

upload: package
	echo $(LAMBDA_FUNCTION_NAME)
	aws s3 cp --recursive --profile=aseaman $(PACKAGE_DIR) s3://aseaman-lambda-functions/$(DEPLOY_ENV)

clean:
	rm -rf ./venv/
	rm -rf $(PACKAGE_DIR)


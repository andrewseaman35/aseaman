PACKAGE_DIR = packages
DEPLOY_ENV ?= test
LAMBDA_FUNCTION_NAME ?= lambda_function

venv:
	virtualenv venv --python=python3

package_dir:
	mkdir -p $(PACKAGE_DIR)

package: package_dir venv
	venv/bin/pip install -r lambda_function/requirements.txt -t lambda_function
	cd lambda_function && zip -r ../$(PACKAGE_DIR)/$(LAMBDA_FUNCTION_NAME).zip *

upload: package
	echo $(LAMBDA_FUNCTION_NAME)
	aws s3 cp --recursive $(PACKAGE_DIR) s3://aseaman-lambda-functions/$(DEPLOY_ENV)

clean:
	rm -rf ./venv/
	rm -rf $(PACKAGE_DIR)


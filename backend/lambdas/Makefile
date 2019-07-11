PACKAGE_DIR = packages
DEPLOY_ENV ?= test
LAMBDA_FUNCTION_NAME ?= lambda_function
WHISKY_API_NAME ?= whisky_api

deploy_venv: requirements.txt
	virtualenv deploy_venv --python=python3 --no-site-packages
	deploy_venv/bin/pip install -r requirements.txt

venv:
	virtualenv venv --python=python3

package_dir:
	mkdir -p $(PACKAGE_DIR)
	mkdir -p $(PACKAGE_DIR)/$(LAMBDA_FUNCTION_NAME)
	mkdir -p $(PACKAGE_DIR)/$(WHISKY_API_NAME)

package: package_dir venv
	venv/bin/pip install -r state_check/requirements.txt -t $(PACKAGE_DIR)/$(LAMBDA_FUNCTION_NAME)
	venv/bin/pip install -r whisky_shelf/requirements.txt -t $(PACKAGE_DIR)/$(WHISKY_API_NAME)
	cp -r state_check/* $(PACKAGE_DIR)/$(LAMBDA_FUNCTION_NAME)
	cp -r whisky_shelf/* $(PACKAGE_DIR)/$(WHISKY_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(LAMBDA_FUNCTION_NAME)
	cp -r base $(PACKAGE_DIR)/$(WHISKY_API_NAME)
	cd $(PACKAGE_DIR)/$(LAMBDA_FUNCTION_NAME) && zip -r ../$(LAMBDA_FUNCTION_NAME).zip *
	cd $(PACKAGE_DIR)/$(WHISKY_API_NAME) && zip -r ../$(WHISKY_API_NAME).zip *

upload: package
	echo $(LAMBDA_FUNCTION_NAME) $(WHISKY_API_NAME)
	aws s3 cp --recursive $(PACKAGE_DIR) s3://aseaman-lambda-functions/$(DEPLOY_ENV)

clean:
	rm -rf ./deploy_venv/
	rm -rf ./venv/
	rm -rf $(PACKAGE_DIR)


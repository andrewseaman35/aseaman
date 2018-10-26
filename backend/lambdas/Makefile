PACKAGE_DIR = packages

venv:
	virtualenv venv --python=python3

package_dir:
	mkdir -p $(PACKAGE_DIR)

package: package_dir venv
	venv/bin/pip install -r lambda_function/requirements.txt -t lambda_function
	cd lambda_function && zip -r ../$(PACKAGE_DIR)/lambda_function.zip *

upload: package
	aws s3 cp --recursive $(PACKAGE_DIR) s3://aseaman-lambda-functions/test/packages

clean:
	rm -rf ./venv/
	rm -rf $(PACKAGE_DIR)

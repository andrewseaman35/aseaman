venv:
	virtualenv venv --python=python3

package: venv
	venv/bin/pip install -r lambda_function/requirements.txt -t lambda_function
	cd lambda_function && zip -r lambda_function.zip * 

deploy: package
	aws s3 cp lambda_function/lambda_function.zip s3://aseaman-lambda-functions/lambda_function.zip

clean:
	rm -rf ./venv/
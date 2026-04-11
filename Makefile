export
VENV_PYTHON := python

ifeq ($(DEPLOY_ENV), stage)
	API_URL := api.stage.andrewcseaman.com
else ifeq ($(DEPLOY_ENV), live)
	API_URL := api.live.andrewcseaman.com
endif

assert_deploy_vars:
	@if [ "$(API_URL)" = "" ]; then\
		echo "DEPLOY_ENV not set correctly: [stage, live] permitted";\
		exit 2;\
	fi

venv: requirements.txt
	pyenv virtualenv aseaman-venv --python=python3.13
	pyenv activate aseaman-venv
	pip install -r requirements.txt

website:
	make -C website
	# Need index.html with suffix for default page
	# cp website/public/index website/public/index.html

deploy_api:
	make -C backend tfapply

deploy_website: website
	echo "Updating website S3 files"
	aws s3 rm s3://$(DEPLOY_ENV).andrewcseaman.com --recursive > /dev/null
	aws s3 cp website/public/js/bundle.js s3://$(DEPLOY_ENV).andrewcseaman.com/js/bundle.js > /dev/null
	aws s3 cp --recursive website/public/css/ s3://$(DEPLOY_ENV).andrewcseaman.com/css > /dev/null
	aws s3 cp --recursive --exclude "local_data/*" --exclude "js/*" --exclude "css/*" --content-type text/html website/public/ s3://$(DEPLOY_ENV).andrewcseaman.com > /dev/null

deploy: assert_deploy_vars deploy_api deploy_website deploy_shared
	make -C website local

# Deploy only the IAM role policy for a single API (no packaging required).
# Note: salt_level is an exception — its module is named salt_level_api_iam_role_policy.
# Usage: DEPLOY_ENV=<env> API=<api_name> make deploy_infra
deploy_infra: assert_deploy_vars
	@if [ "$(API)" = "" ]; then echo "API not set. Usage: DEPLOY_ENV=<env> API=<api_name> make deploy_infra"; exit 2; fi
	cd backend/deployments/$(DEPLOY_ENV) && terraform apply \
		-target=module.backend.module.$(API)_iam_role_policy \
		-auto-approve

deploy_lambda: assert_deploy_vars
	@if [ "$(API)" = "" ]; then echo "API not set. Usage: DEPLOY_ENV=<env> API=<api_name> make deploy_lambda"; exit 2; fi
	make -C backend/api package_single API=$(API)
	aws lambda update-function-code \
		--function-name $(API)-api-$(DEPLOY_ENV) \
		--zip-file fileb://backend/api/packages/$(API)_api.zip \
		--profile aseaman \
		--region us-east-1 > /dev/null
	@echo "Deployed $(API)-api-$(DEPLOY_ENV)"

deploy_job: assert_deploy_vars
	@if [ "$(JOB)" = "" ]; then echo "JOB not set. Usage: DEPLOY_ENV=<env> JOB=<job_name> make deploy_job"; exit 2; fi
	make -C backend/jobs package_single JOB=$(JOB)
	aws lambda update-function-code \
		--function-name $(JOB)-$(DEPLOY_ENV) \
		--zip-file fileb://backend/jobs/packages/$(JOB).zip \
		--profile aseaman \
		--region us-east-1 > /dev/null
	@echo "Deployed $(JOB)-$(DEPLOY_ENV)"

deploy_shared:
	make -C backend tfapply_shared

watch: #venv
	$(VENV_PYTHON) scripts/run_watchers.py

lint:
	$(VENV_PYTHON) -m black .

clean:
	rm -rf venv
	make -C backend clean
	make -C website clean

.PHONY: deploy_api deploy_website deploy deploy_lambda deploy_job deploy_infra clean website

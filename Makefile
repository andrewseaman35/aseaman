export
VENV_PYTHON := venv/bin/python
LOCAL_PORT := 8123

ifeq ($(DEPLOY_ENV), stage)
	API_URL := api.stage.andrewcseaman.com
else ifeq ($(DEPLOY_ENV), live)
	API_URL := api.live.andrewcseaman.com
else 
$(error DEPLOY_ENV must be set to either [stage, live])
endif
	
venv: requirements.txt
	virtualenv venv --python=python3
	venv/bin/pip install -r requirements.txt

website: venv
	make -C website

deploy_api:
	make -C backend tfapply

deploy_website: website
	echo "Updating website S3 files"
	aws s3 rm s3://$(DEPLOY_ENV).andrewcseaman.com --recursive > /dev/null
	aws s3 cp --recursive --exclude=website/js/src/* website/public/ s3://$(DEPLOY_ENV).andrewcseaman.com > /dev/null

deploy: deploy_api deploy_website

watch: venv
	$(VENV_PYTHON) scripts/run_watchers.py

start_local: venv
	make -C website local
	cd website/public/ && python3 -m http.server $(LOCAL_PORT)

clean:
	rm -rf venv
	make -C backend clean
	make -C website clean

.PHONY: deploy_api deploy_website deploy clean website

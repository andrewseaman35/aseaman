export FLASK_APP := local_backend.py

PACKAGE_DIR = packages
DEPLOY_ENV ?= test
STATE_API_NAME ?= state_api
WHISKY_API_NAME ?= whisky_api
DRAW_JASPER_API_NAME ?= draw_jasper_api
SALT_LEVEL_API_NAME ?= salt_level_api
COMPARE_ACNH_API_NAME ?= compare_acnh_api
MAME_HIGHSCORE_API_NAME ?= mame_highscore_api
CHESS_API_NAME ?= chess_api

deploy_venv: requirements.txt
	virtualenv deploy_venv --python=python3 --no-site-packages
	deploy_venv/bin/pip install -r requirements.txt

venv:
	virtualenv venv --python=python3

package_dir:
	rm -rf $(PACKAGE_DIR)
	mkdir -p $(PACKAGE_DIR)
	mkdir -p $(PACKAGE_DIR)/$(STATE_API_NAME)
	mkdir -p $(PACKAGE_DIR)/$(WHISKY_API_NAME)

package: package_dir venv
	echo "Packaging backend lambda functions"
	venv/bin/pip install -r state_check/requirements.txt -t $(PACKAGE_DIR)/$(STATE_API_NAME)
	venv/bin/pip install -r whisky_shelf/requirements.txt -t $(PACKAGE_DIR)/$(WHISKY_API_NAME)
	venv/bin/pip install -r draw_jasper/requirements.txt -t $(PACKAGE_DIR)/$(DRAW_JASPER_API_NAME)
	venv/bin/pip install -r salt_level/requirements.txt -t $(PACKAGE_DIR)/$(SALT_LEVEL_API_NAME)
	venv/bin/pip install -r compare_acnh/requirements.txt -t $(PACKAGE_DIR)/$(COMPARE_ACNH_API_NAME)
	venv/bin/pip install -r mame_highscore/requirements.txt -t $(PACKAGE_DIR)/$(MAME_HIGHSCORE_API_NAME)
	venv/bin/pip install -r chess/requirements.txt -t $(PACKAGE_DIR)/$(CHESS_API_NAME)
	cp -r state_check/* $(PACKAGE_DIR)/$(STATE_API_NAME)
	cp -r whisky_shelf/* $(PACKAGE_DIR)/$(WHISKY_API_NAME)
	cp -r draw_jasper/* $(PACKAGE_DIR)/$(DRAW_JASPER_API_NAME)
	cp -r salt_level/* $(PACKAGE_DIR)/$(SALT_LEVEL_API_NAME)
	cp -r compare_acnh/* $(PACKAGE_DIR)/$(COMPARE_ACNH_API_NAME)
	cp -r mame_highscore/* $(PACKAGE_DIR)/$(MAME_HIGHSCORE_API_NAME)
	cp -r chess/* $(PACKAGE_DIR)/$(CHESS_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(STATE_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(WHISKY_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(DRAW_JASPER_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(SALT_LEVEL_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(COMPARE_ACNH_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(MAME_HIGHSCORE_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(CHESS_API_NAME)
	cd $(PACKAGE_DIR) && find . -maxdepth 6 -type f -name "*.pyc" -delete
	cd $(PACKAGE_DIR)/$(STATE_API_NAME) && zip -r ../$(STATE_API_NAME).zip * > /dev/null
	cd $(PACKAGE_DIR)/$(WHISKY_API_NAME) && zip -r ../$(WHISKY_API_NAME).zip * > /dev/null
	cd $(PACKAGE_DIR)/$(DRAW_JASPER_API_NAME) && zip -r ../$(DRAW_JASPER_API_NAME).zip * > /dev/null
	cd $(PACKAGE_DIR)/$(SALT_LEVEL_API_NAME) && zip -r ../$(SALT_LEVEL_API_NAME).zip * > /dev/null
	cd $(PACKAGE_DIR)/$(COMPARE_ACNH_API_NAME) && zip -r ../$(COMPARE_ACNH_API_NAME).zip * > /dev/null
	cd $(PACKAGE_DIR)/$(MAME_HIGHSCORE_API_NAME) && zip -r ../$(MAME_HIGHSCORE_API_NAME).zip * > /dev/null
	cd $(PACKAGE_DIR)/$(CHESS_API_NAME) && zip -r ../$(CHESS_API_NAME).zip * > /dev/null

upload: package
	echo "Uploading lambda functions"
	aws s3 cp --recursive $(PACKAGE_DIR) s3://aseaman-lambda-functions/$(DEPLOY_ENV) >> /dev/null

local_venv: local_requirements.txt
	virtualenv local_venv --python=python3
	local_venv/bin/pip install -r local_requirements.txt

freeze_local_venv:
	local_venv/bin/pip freeze > local_requirements.txt

start_local: local_venv
	local_venv/bin/python local_backend.py

clean:
	rm -rf ./deploy_venv/
	rm -rf ./venv/
	rm -rf $(PACKAGE_DIR)

.PHONY: package package_dir upload clean


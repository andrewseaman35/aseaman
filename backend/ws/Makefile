PACKAGE_DIR = packages

BASE_API_NAME := base

deploy_venv: requirements.txt
	# pyenv virtualenv aseaman_ws_venv --python=python3.13
	pyenv activate aseaman_ws_venv
	pip install -r requirements.txt

venv:
	pyenv virtualenv ws-venv --python=python3.13
	pyenv activate ws-venv
	virtualenv venv --python=python3

package_dir:
	rm -rf $(PACKAGE_DIR)
	mkdir -p $(PACKAGE_DIR)

package: venv package_dir
	echo "Packaging websocket lambda functions"
	venv/bin/pip install -r base/requirements.txt -t $(PACKAGE_DIR)/$(BASE_API_NAME)
	cp -r base/* $(PACKAGE_DIR)/$(BASE_API_NAME)
	cd $(PACKAGE_DIR) && find . -maxdepth 6 -type f -name "*.pyc" -delete
	cd $(PACKAGE_DIR)/$(BASE_API_NAME) && zip -r ../$(BASE_API_NAME).zip * > /dev/null

clean:
	rm -rf ./deploy_venv/
	rm -rf ./venv/
	rm -rf $(PACKAGE_DIR)

.PHONY: package package_dir upload clean test
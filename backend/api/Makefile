export FLASK_APP := local_backend.py

PACKAGE_DIR = packages

DRAW_JASPER_API_NAME := draw_jasper_api
SALT_LEVEL_API_NAME := salt_level_api
COMPARE_ACNH_API_NAME := compare_acnh_api
EVENT_API_NAME := event_api
MAME_HIGHSCORE_API_NAME := mame_highscore_api
CHESS_API_NAME := chess_api
LINKER_API_NAME := linker_api
BUDGET_API_NAME := budget_api
SPLITOMATIC_API_NAME := splitomatic_api
WS_API_NAME := ws_api

deploy_venv: requirements.txt
	virtualenv deploy_venv --python=python3 --no-site-packages
	deploy_venv/bin/pip install -r requirements.txt

venv:
	virtualenv venv --python=python3

package_dir:
	rm -rf $(PACKAGE_DIR)
	mkdir -p $(PACKAGE_DIR)

package: venv package_dir
	echo "Packaging backend lambda functions"
	pip install -r draw_jasper/requirements.txt -t $(PACKAGE_DIR)/$(DRAW_JASPER_API_NAME)
	pip install -r salt_level/requirements.txt -t $(PACKAGE_DIR)/$(SALT_LEVEL_API_NAME)
	pip install -r compare_acnh/requirements.txt -t $(PACKAGE_DIR)/$(COMPARE_ACNH_API_NAME)
	pip install -r event/requirements.txt -t $(PACKAGE_DIR)/$(EVENT_API_NAME)
	pip install -r mame_highscore/requirements.txt -t $(PACKAGE_DIR)/$(MAME_HIGHSCORE_API_NAME)
	pip install -r chess/requirements.txt -t $(PACKAGE_DIR)/$(CHESS_API_NAME)
	pip install -r linker/requirements.txt -t $(PACKAGE_DIR)/$(LINKER_API_NAME)
	pip install -r budget/requirements.txt -t $(PACKAGE_DIR)/$(BUDGET_API_NAME)
	pip install -r splitomatic/requirements.txt -t $(PACKAGE_DIR)/$(SPLITOMATIC_API_NAME)
	pip install -r ws/requirements.txt -t $(PACKAGE_DIR)/$(WS_API_NAME)
	cp -r draw_jasper/* $(PACKAGE_DIR)/$(DRAW_JASPER_API_NAME)
	cp -r salt_level/* $(PACKAGE_DIR)/$(SALT_LEVEL_API_NAME)
	cp -r compare_acnh/* $(PACKAGE_DIR)/$(COMPARE_ACNH_API_NAME)
	cp -r event/* $(PACKAGE_DIR)/$(EVENT_API_NAME)
	cp -r mame_highscore/* $(PACKAGE_DIR)/$(MAME_HIGHSCORE_API_NAME)
	cp -r chess/* $(PACKAGE_DIR)/$(CHESS_API_NAME)
	cp -r linker/* $(PACKAGE_DIR)/$(LINKER_API_NAME)
	cp -r budget/* $(PACKAGE_DIR)/$(BUDGET_API_NAME)
	cp -r splitomatic/* $(PACKAGE_DIR)/$(SPLITOMATIC_API_NAME)
	cp -r ws/* $(PACKAGE_DIR)/$(WS_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(DRAW_JASPER_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(SALT_LEVEL_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(COMPARE_ACNH_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(EVENT_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(MAME_HIGHSCORE_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(CHESS_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(LINKER_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(BUDGET_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(SPLITOMATIC_API_NAME)
	cp -r base $(PACKAGE_DIR)/$(WS_API_NAME)
	cd $(PACKAGE_DIR) && find . -maxdepth 6 -type f -name "*.pyc" -delete
	cd $(PACKAGE_DIR)/$(DRAW_JASPER_API_NAME) && zip -r ../$(DRAW_JASPER_API_NAME).zip * > /dev/null
	cd $(PACKAGE_DIR)/$(SALT_LEVEL_API_NAME) && zip -r ../$(SALT_LEVEL_API_NAME).zip * > /dev/null
	cd $(PACKAGE_DIR)/$(COMPARE_ACNH_API_NAME) && zip -r ../$(COMPARE_ACNH_API_NAME).zip * > /dev/null
	cd $(PACKAGE_DIR)/$(EVENT_API_NAME) && zip -r ../$(EVENT_API_NAME).zip * > /dev/null
	cd $(PACKAGE_DIR)/$(MAME_HIGHSCORE_API_NAME) && zip -r ../$(MAME_HIGHSCORE_API_NAME).zip * > /dev/null
	cd $(PACKAGE_DIR)/$(CHESS_API_NAME) && zip -r ../$(CHESS_API_NAME).zip * > /dev/null
	cd $(PACKAGE_DIR)/$(LINKER_API_NAME) && zip -r ../$(LINKER_API_NAME).zip * > /dev/null
	cd $(PACKAGE_DIR)/$(BUDGET_API_NAME) && zip -r ../$(BUDGET_API_NAME).zip * > /dev/null
	cd $(PACKAGE_DIR)/$(SPLITOMATIC_API_NAME) && zip -r ../$(SPLITOMATIC_API_NAME).zip * > /dev/null
	cd $(PACKAGE_DIR)/$(WS_API_NAME) && zip -r ../$(WS_API_NAME).zip * > /dev/null

test:
	@if [ "$(IN_DOCKER_API)" = "true" ]; then\
		python -m unittest;\
	else\
		echo "Run tests from within API Docker container";\
		exit 2;\
	fi

clean:
	rm -rf ./deploy_venv/
	rm -rf ./venv/
	rm -rf $(PACKAGE_DIR)

.PHONY: package package_dir upload clean test

export
ROOTDIR := $(shell git rev-parse --show-toplevel)
VENV_PYTHON := $(ROOTDIR)/venv/bin/python
SCRIPTS := $(ROOTDIR)/scripts
CONFIG := $(ROOTDIR)/config

all: config website

local: local_config website

website: js css html assets

local_config: $(CONFIG)/web_template.json $(SCRIPTS)/generate_config.py
	$(VENV_PYTHON) $(SCRIPTS)/generate_config.py --local

config: $(CONFIG)/web_template.json $(SCRIPTS)/generate_config.py
	$(VENV_PYTHON) $(SCRIPTS)/generate_config.py --stack-name=${STACKNAME} --deploy-env=${DEPLOY_ENV}

node_modules: package.json package-lock.json
	npm -g install . --save-dev

watch: $(SCRIPTS)/compile_html.py
	$(VENV_PYTHON) $(SCRIPTS)/compile_html.py --watch

html: $(SCRIPTS)/compile_html.py
	$(VENV_PYTHON) $(SCRIPTS)/compile_html.py

js: node_modules
	mkdir -p public/js/
	browserify js/src/main.js -o public/js/bundle.js -d

css:
	mkdir -p public/css/
	sass scss/main.scss public/css/main.css

assets:
	cp -r img public/img/

clean:
	rm -rf public/
	rm -rf node_modules

.PHONY: package deploy_api deploy_website deploy_test_website deploy deploy_test remove_old_stacks clean static js

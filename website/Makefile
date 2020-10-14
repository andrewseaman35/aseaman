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

package-lock.json: package.json
	npm update

node_modules: package.json package-lock.json
	npm -g install . --all

html: $(SCRIPTS)/compile_html.py
	$(VENV_PYTHON) $(SCRIPTS)/compile_html.py

build_local_js:
	mkdir -p public/js/
	./node_modules/.bin/babel js/src --out-dir public/lib
	browserify public/lib/main.js -o public/js/bundle.js -d

build_js:
	mkdir -p public/js/
	./node_modules/.bin/babel js/src --out-dir public/lib
	browserify public/lib/main.js -d | ./node_modules/.bin/terser -cm > public/js/bundle.js

js: node_modules build_js

css:
	mkdir -p public/css/
	sass scss/main.scss public/css/main.css

assets:
	cp -r img/ public/img/
	cp -r local_data public/ || :

clean:
	rm -rf public/
	rm -rf node_modules/

.PHONY: package deploy_api deploy_website deploy_test_website deploy deploy_test remove_old_stacks clean static js

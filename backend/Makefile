export
ROOT := $(shell pwd)

CONTAINER_NAME := aseaman-backend

tfinit:
	cd deployments/$(DEPLOY_ENV) && terraform init

tfplan: #package
	cd deployments/stage && terraform plan

tfapply: package #<-- disabled for now since I can't rebuild the draw_jasper api on an M1 yet
	cd deployments/$(DEPLOY_ENV) && terraform apply

package:
	make -C api package

assert_running:
	@if [ ! "$$(docker ps | grep $(CONTAINER_NAME))" ]; then\
		echo "Container not running; run 'make start'";\
		exit 2;\
	fi

assert_not_running:
	@if [ "$$(docker ps | grep $(CONTAINER_NAME))" ]; then\
		echo "Container already running: $(CONTAINER_NAME)";\
		exit 2;\
	fi

test:
	make -C api test

build:
	docker build --file development/Dockerfile --tag aseaman-local:latest .

start: assert_not_running build
	docker run \
		-d \
		-p 8099:8099 \
		--mount type=bind,source="$(ROOT)/api",target=/app \
		--mount type=bind,source="$(HOME)/.aws/credentials",target=/.aws/credentials,readonly \
		--name $(CONTAINER_NAME) \
		aseaman-local

stop:
	@if [ "$$(docker ps -a | grep $(CONTAINER_NAME))" ]; then\
		echo "Removing $(CONTAINER_NAME)";\
		docker rm -f $(CONTAINER_NAME);\
	fi

restart: stop start

sh: assert_running
	docker exec -it $(CONTAINER_NAME) /bin/bash

test_ci: start
	docker exec $(CONTAINER_NAME) make test
	make stop

clean:
	make -C api clean

.PHONY: tfplan tfapply clean sh assert_running assert_not_running

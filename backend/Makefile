export
ROOT := $(shell pwd)

CONTAINER_NAME := aseaman-backend

tfinit:
	cd deployments/$(DEPLOY_ENV) && terraform init

tfplan: #package
	cd deployments/$(DEPLOY_ENV) && terraform plan

tfapply: package
	cd deployments/$(DEPLOY_ENV) && terraform apply

tfapply_local:
	make -C jobs package
	cd deployments/local && terraform apply -auto-approve
	cd deployments/shared && terraform apply -auto-approve

tfapply_shared: package_shared
	cd deployments/shared && terraform apply

package: package_shared
	make -C api package

package_shared:
	make -C jobs package

assert_running:
	@if [ ! "$$(docker ps -a | grep $(CONTAINER_NAME))" ]; then\
		echo "Container not running; run 'make start'";\
		exit 2;\
	fi

assert_not_running:
	@if [ "$$(docker ps -a | grep $(CONTAINER_NAME))" ]; then\
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

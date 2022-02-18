export
ROOT := $(shell pwd)

CONTAINER_ID := $(shell docker ps | grep 'aseaman-local' | awk '{ print $$1 }')


tfplan: #package
	cd deployments/stage && terraform plan

tfapply: #package <-- disabled for now since I can't rebuild the draw_jasper api on an M1 yet
	cd deployments/$(DEPLOY_ENV) && terraform apply

assert_running:
ifeq ($(CONTAINER_ID),)
	$(error Container not running; run `make start_local`)
endif

assert_not_running:
ifneq ($(CONTAINER_ID),)
	$(error Container already running: $(CONTAINER_ID))
endif

build:
	docker build --file development/Dockerfile --tag aseaman-local:latest .

start: build assert_not_running
	docker run \
		-d \
		-p 8099:8099 \
		--mount type=bind,source="$(ROOT)/api",target=/app \
		--mount type=bind,source="$(HOME)/.aws/credentials",target=/.aws/credentials,readonly \
		aseaman-local

stop:
ifneq ($(CONTAINER_ID),)
	docker kill $(CONTAINER_ID)
endif

restart: stop start

sh: assert_running
	docker exec -it $(CONTAINER_ID) /bin/bash

clean:
	make -C api clean

.PHONY: tfplan tfapply clean sh assert_running assert_not_running

export
ROOT := $(shell pwd)

tfplan: package
	cd deployments/stage && terraform plan

tfapply: #package <-- disabled for now since I can't rebuild the draw_jasper api on an M1 yet
	cd deployments/$(DEPLOY_ENV) && terraform apply

build_local:
	docker build --file development/Dockerfile --tag aseaman-local:latest .

start_local: build_local
	docker run \
		-d \
		-p 8099:8099 \
		--mount type=bind,source="$(ROOT)/api",target=/app \
		--mount type=bind,source="$(HOME)/.aws/credentials",target=/.aws/credentials,readonly \
		aseaman-local


clean:
	make -C api clean

.PHONY: tfplan tfapply clean

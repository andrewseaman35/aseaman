export
ROOT := $(shell pwd)

tfplan: package
	cd deployments/stage && terraform plan

tfapply:
	cd deployments/$(DEPLOY_ENV) && terraform apply

clean:
	make -C api clean

.PHONY: tfplan tfapply clean

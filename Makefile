package:
	make -C backend package

deploy:
	make -C backend deploy

clean:
	make -C backend clean

.PHONY: package deploy clean

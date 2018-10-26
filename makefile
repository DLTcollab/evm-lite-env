ENV = local
VERSION = 0.1.1 # evm-lite Docker Image
CONSENSUS = babble # babble or solo
NODES = 1
IPBASE = node
IPADD = 0

up: conf start

conf:
	docker pull -a capjupiter/evm-lite
	$(MAKE) -C conf/$(CONSENSUS) conf NODES=$(NODES) IPBASE=$(IPBASE) IPADD=$(IPADD)

start:
	$(MAKE) -C terraform/$(ENV) apply NODES=$(NODES) CONSENSUS=$(CONSENSUS) VERSION=$(VERSION)

stop:
	$(MAKE) -C terraform/$(ENV) destroy

.PHONY: up conf start stop

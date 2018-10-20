ENV = local  
VERSION = latest # evm-lite Docker Image
USER = 1000 # user that run evml inside the docker containers. (try 501 in MacOS)
CONSENSUS = babble 
NODES = 1
IPBASE = node 
IPADD = 0 

up: conf start

conf:
	docker pull -a capjupiter/evm-lite
	$(MAKE) -C conf/$(CONSENSUS) conf NODES=$(NODES) IPBASE=$(IPBASE) IPADD=$(IPADD)

start: 
	$(MAKE) -C terraform/ apply NODES=$(NODES) CONSENSUS=$(CONSENSUS) VERSION=$(VERSION) USER=$(USER)

stop:
	$(MAKE) -C terraform/ destroy

.PHONY: up conf start stop
	

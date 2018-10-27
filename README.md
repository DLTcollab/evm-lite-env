# EVM Lite Environment
Deploy environment for running Ethereum node with Babble consensus.

## Prerequisites
1. Install the Docker
2. Install the Terraform
3. Initialize the Terraform
```shell
$ cd evm-lite-env/deploy/terraform/local
$ terraform init
```

## Manage Enviroment

### Launch Docker
```bash
deploy $ make NODES=[Number of nodes] # e.g.make NODES=4
```

### Stop Docker
```bash
deploy $ make stop
```

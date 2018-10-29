# EVM Lite Environment
Deploy environment for running Ethereum node with Babble consensus.

## Prerequisites
1. Install the Docker
2. Install the Terraform
3. Initialize the Terraform
```shell
$ cd evm-lite-env/terraform/local
$ terraform init
```

## Manage Enviroment

### Launch Docker
```bash
$ make NODES=[Number of nodes] # e.g.make NODES=4
```

### Stop Docker
```bash
$ make stop
```

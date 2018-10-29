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

## Licensing
This project is freely redistributable under the MIT License. Use of this source
code is governed by a MIT-style license that can be found in the `LICENSE` file.

This project utilizes parts of `EVM-LITE` library which is freely redistributable
under MIT License that can be found in the `LICENSE.evm` file.

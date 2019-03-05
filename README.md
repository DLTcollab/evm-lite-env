# Lightweight EVM-based Smart Contract Development Environment

An effective Ethereum Virtual Machine (EVM) based smart contract runtime without complete Ethereum dependency.

## Getting Started

### Prerequisites

1. Install Docker
2. Install [Terraform](https://www.terraform.io/)
3. Initialize Terraform in advance.
```shell
$ cd evm-lite-env/terraform/local
$ terraform init
```
### Manage Enviroment

#### Launch Docker
```bash
$ make CONSENSUS=[consensus] NODES=[Number of nodes]
```
Parameters :
-   CONSENSUS : solo, babble
-   NODES: number of nodes in the network

example
```bash
$ make CONSENSUS=babble NODES=4
```

#### Stop Docker
```bash
$ make stop
```

### Usage and Examples

#### Prerequisites

1. Install [Node.js](https://nodejs.org/en/)
2. Install the dependencies
```
npm install
```

This section please refer to the `usage` folder..

### Coding style 
evm-lite-env defers to [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript),
also contains an ESLint configuration which you can use to validate your JavaScript code style.

#### Lint JavaScript with ESLint.
```
npm run lint
```

## Licensing
This project is freely redistributable under the MIT License. Use of this source
code is governed by a MIT-style license that can be found in the `LICENSE` file.
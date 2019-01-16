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

This section describes basic usage for `evm-lite-env` and introduces the `example` directory.

#### Transfer

##### 1. Init the transaction addresses.

```javascript
const from = '';
const to = ''; 
```
example
```javascript
const from = '0x479e8b1b9d8b509755677f6d61d2f7339ba4c0fd';
const to = '0x1dEC6F07B50CFa047873A508a095be2552680874';
```

##### 2. Set the send amount.

```javascript
const value = '';
```
example
```javascript
const value = 20000;
```

##### 3. Define the evm-lite wallet path.
This step help get keystore object from the keystore directory and decrypt.
```javascript
const dataDirectory = new evmlib.DataDirectory('');
```
example
```javascript
const dataDirectory = new evmlib.DataDirectory('/Users/junwei/.evmlc');
```

##### 4. Define the account password.
```javascript
const password = '';
```
example
```javascript
const password = 'superpassword';
```

#### Contract Deployment
##### 1. Init the transaction addresses.
```javascript
const from = '';
```
example
```javascript
const from = '0x479e8b1b9d8b509755677f6d61d2f7339ba4c0fd';
```

##### 2. Define the evm-lite wallet path.
This step help get keystore object from the keystore directory and decrypt.
```javascript
const dataDirectory = new evmlib.DataDirectory('');
```
example
```javascript
const dataDirectory = new evmlib.DataDirectory('/Users/junwei/.evmlc');
```

##### 3. Define the from account password.
```javascript
const password = '';
```
example
```javascript
const password = 'superpassword';
```
   
##### 4. Define the contract location which you want to upload.
```javascript
const contractPath = '';
```
example
```javascript
const contractPath = '/Users/junwei/CrowdFunding.sol';
```

##### 5. Define the contract name.
It must same as the contract name which in the solidity file.
```javascript
const rawContractName = '';
```
example
```javascript
const rawContractName = 'CrowdFunding';
```

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
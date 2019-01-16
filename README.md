# Lightweight EVM node Development Environment
Deploy environment for running EVM node with Babble consensus.

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
$ make CONSENSUS=[consensus] NODES=[Number of nodes] 
# e.g.make CONSENSUS=babble NODES=4
```
Parameters :
-   CONSENSUS : solo, babble
-   NODES: number of nodes in the network
### Stop Docker
```bash
$ make stop
```

## Usage

As well as the following description, you can take a look at our examples folder for more.

### Transfer

1. Init the transaction addresses.
   ```javascript
    const from = '[from address]';
    const to = '[to address]';
    //const from = '0x479e8b1b9d8b509755677f6d61d2f7339ba4c0fd';
    //const to = '0x1dEC6F07B50CFa047873A508a095be2552680874';
   ```

2. Set the send amount.
    ```javascript
    const value = '[value]';
    //const value = 20000;
    ```

3. Define the evm-lite wallet path.
    This step help get keystore object from the keystore directory and decrypt.
    ```javascript
    const dataDirectory = new evmlib.DataDirectory('[evmlc path]/.evmlc');
    //const dataDirectory = new evmlib.DataDirectory('/Users/junwei/.evmlc');
    ```

4. Define the account password.
   ```javascript
   const password = '[password]';
   //const password = 'superpassword;
   ```

### Contract Deployment
1. Init the transaction addresses.
   ```javascript
    const from = '[from address]';
    //const from = '0x479e8b1b9d8b509755677f6d61d2f7339ba4c0fd';
   ```
2. Define the evm-lite wallet path.
    This step help get keystore object from the keystore directory and decrypt.
    ```javascript
    const dataDirectory = new evmlib.DataDirectory('[evmlc path]/.evmlc');
    //const dataDirectory = new evmlib.DataDirectory('/Users/junwei/.evmlc');
    ```
3. Define the from account password.
   ```javascript
   const password = '[password]';
   //const password = 'superpassword;
   ```
4. Define the contract location which you want to upload.
   ```javascript
   const contractPath = '[contract path]';
   //const contractPath = '/Users/junwei/CrowdFunding.sol';
   ```
5. Define the contract name.
   It must same as the contract name which in the solidity file.
   ```javascript
   const contractName = ':' + '[contract name]';
   //const contractName = ':' + 'CrowdFunding';
   ```

## Licensing
This project is freely redistributable under the MIT License. Use of this source
code is governed by a MIT-style license that can be found in the `LICENSE` file.



### Usage

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
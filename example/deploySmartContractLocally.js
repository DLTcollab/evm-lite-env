const EVMLC = require('evm-lite-lib').EVMLC;
const KeyStore = require('evm-lite-lib').Keystore;
const Accounts = require('evm-lite-lib').Account;
const solc = require('solc');
const fs = require('fs');

const from = '0x1a5c6b111e883d920fd24fee0bafae838958fa05'

// EVMLC object
const evmlc = new EVMLC('127.0.0.1', 8080, {
    from,
    gas: 1000000,
    gasPrice: 0
});

// Keystore object
const keystore = new KeyStore('/Users/junwei/.evmlc', 'keystore');

// Contract Object
const contractPath = '/Users/junwei/Documents/CrowdFunding.sol';
const contractFile = fs.readFileSync(contractPath, 'utf8');
const contractName = ':' + 'CrowdFunding';

const output = solc.compile(contractFile, 1);
const ABI = JSON.parse(output.contracts[contractName].interface);

// Deploy The Smart Contract
async function deploySmartContract() {
    // Decrypted The Account
    const keystoreFile = await keystore.get(from);
    const decryptedAccount = Accounts.decrypt(keystoreFile, 'superpassword');
    const DeployedContract = evmlc.generateContractFromABI(ABI);

    DeployedContract.data(output.contracts[contractName].bytecode);

    const deployTransaction = DeployedContract.deploy({parameters: [10000]});

    const signedTransaction = await decryptedAccount.signTransaction(deployTransaction);
    return await deployTransaction.sendRaw(signedTransaction.rawTransaction);
}

deploySmartContract()
    .then((txResponse) => console.log(txResponse))
    .catch((error) => console.log(error));
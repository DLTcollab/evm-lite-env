const EVMLC = require('evm-lite-lib').EVMLC;
const KeyStore = require('evm-lite-lib').Keystore;
const Accounts = require('evm-lite-lib').Account;
const solc = require('solc');
const fs = require('fs');

// Default from address
const from = '0x1a5c6b111e883d920fd24fee0bafae838958fa05';

// Config evm-lite IP
const nodeIP = '127.0.0.1';

// Data directory object
const dataDirectory = new evmlib.DataDirectory('/Users/junwei.evmlc');

// Password for keystore
const password = 'superpassword';

// Contract object
const contractPath = '/Users/junwei/Documents/CrowdFunding.sol';
const rawContractname = 'CrowdFunding';

const contractFile = fs.readFileSync(contractPath, 'utf8');
const contractName = ':' + rawContractname;

// EVMLC object
const evmlc = new EVMLC(nodeIP , 8080, {
    from,
    gas: 1000000,
    gasPrice: 0
});

const output = solc.compile(contractFile, 1);
const ABI = JSON.parse(output.contracts[contractName].interface);

// Deploy The Smart Contract
async function deploySmartContract() {

    // Get keystore object from the keystore directory
    // For the from address so we can decrypt and sign
    const keystoreFile = await dataDirectory.keystore.get(from); 

    // Decrypt the account
    const decryptedAccount = Accounts.decrypt(keystoreFile, password);

    // Bytecode of compiled account
    const DeployedContract = await evmlc.generateContractFromABI(ABI);

    // Generate contract to deploy later
    DeployedContract.data(output.contracts[contractName].bytecode);

    // Generate deployment transaction
    const deployTransaction = DeployedContract.deploy({parameters: [10000]});

    // Sign transaction with decrypted account
    const signedTransaction = await decryptedAccount.signTransaction(deployTransaction);

    // Send deployment transaction
    return await deployTransaction.sendRaw(signedTransaction.rawTransaction);
}

deploySmartContract()
    .then((txResponse) => console.log(txResponse))
    .catch((error) => console.log(error));
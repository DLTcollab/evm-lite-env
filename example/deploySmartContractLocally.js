const EVMLC = require('evm-lite-lib').EVMLC;
const DataDirectory = require('evm-lite-lib').DataDirectory;

const solc = require('solc');
const fs = require('fs');

// Default from address
const from = '';

// EVMLC object
const evmlc = new EVMLC('127.0.0.1', 8080, {
  from,
  gas: 1000000,
  gasPrice: 0,
});

// Keystore object
const dataDirectory = new DataDirectory('');
const password = '';


// Contract Object
const contractPath = '';
const rawContractName = '';

const contractFile = fs.readFileSync(contractPath, 'utf8');
const contractName = ':' + rawContractName;

const output = solc.compile(contractFile, 1);
const ABI = JSON.parse(output.contracts[contractName].interface);
const data = output.contracts[contractName].bytecode;

const generateContract = async () => {
  // Get keystore object from the keystore directory
  // For the from address so we can decrypt and sign
  const account = await dataDirectory.keystore.decrypt(from, password);

  // Generate contract object with ABI and data
  const contract = await evmlc.generateContractFromABI(ABI, data);

  // Deploy and return contract with functions populated
  const response = await contract.deploy(account, { parameters: [] });

  return response;
};

generateContract()
  .then(contract => console.log(contract.options.address))
  .catch(error => console.log(error));

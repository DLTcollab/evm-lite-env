const EVMLC = require('evm-lite-lib').EVMLC;
const DataDirectory = require('evm-lite-lib').DataDirectory;

const solc = require('solc');
const fs = require('fs');

// Default from address
const from = '0x5E0D169E00fA4A88c8d8Af89DB99EeE284352c2c';

// EVMLC object
const evmlc = new EVMLC('210.240.162.43', 8080, {
  from,
  gas: 1000000,
  gasPrice: 0,
});

// Keystore object
const dataDirectory = new DataDirectory('/Users/junwei/.evmlc/');
const password = 'password';


// Contract Object
const contractPath = 'usage/demo/solidity/CrowdFunding.sol';
const rawContractName = 'CrowdFunding';

const contractFile = fs.readFileSync(contractPath, 'utf8');
const contractName = `:${rawContractName}`;
const contractAddress = '0x72fa763e43536f180a0476ef62627443eb928d8a';

const output = solc.compile(contractFile, 1);
const ABI = JSON.parse(output.contracts[contractName].interface);
const data = output.contracts[contractName].bytecode;

const generateContract = async () => {
  // Generate contract object with ABI and data
  const contract = await evmlc.generateContractFromABI(ABI, data);

  const cfContract = await contract.setAddressAndPopulate(contractAddress);

  return cfContract;
};

const accountDecrypt = async () => {
  // Get keystore object from the keystore directory
  // For the from address so we can decrypt and sign
  const account = await dataDirectory.keystore.decrypt(from, password);

  console.log(account);

  return account;
};

const contribute = async (account, cfContract) => {
  const transaction = await cfContract.methods.contribute();

  console.log(transaction);

  await transaction.value(200);

  await transaction.nonce(32);

  await transaction.sign(account);

  const response = transaction.submit();

  console.log(transaction);

  return response;
};

const test = async () => {
  const account = await accountDecrypt();

  const cfContract = await generateContract();

  const response = await contribute(account, cfContract);

  return response;
};

test()
  .then(res => console.log(res))
  .catch(error => console.log(error));

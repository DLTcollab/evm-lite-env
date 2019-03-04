const path = require('path');
const os = require('os');
const solc = require('solc');
const fs = require('fs');

const { EVMLC, DataDirectory } = require('evm-lite-lib');

let evmlc;
let contract;
let account;

const errorLog = (text) => {
  console.log(`\x1b[31m${text}\x1b[0m`);
};

const initEVMConnection = async () => {
  try {
    evmlc = new EVMLC('node0.capjupiter.com', 8080, {
      from: '0X3F9D41ECEA757FC4E2B44BE3B38A788DE2F11AD7',
      gas: 100000000,
      gasPrice: 0,
    });
  } catch (error) {
    errorLog(error);
  }
};

const assignEvmlcDirectory = () => {
  const evmlcDirectory = new DataDirectory(
    path.join(os.homedir(), '.evmlc'),
  );
  return evmlcDirectory;
};

const compile = (contractName, fileName) => {
  const contractPath = path.join(
    path.resolve(__dirname),
    `./contract/${fileName}.sol`,
  );
  const contractFile = fs.readFileSync(contractPath, 'utf8');
  const compiledOutput = solc.compile(contractFile, 1);

  return {
    bytecode: compiledOutput.contracts[`:${contractName}`].bytecode,
    abi: JSON.parse(compiledOutput.contracts[`:${contractName}`].interface),
  };
};

const decryptAccount = async (password, evmlcDirectory) => {
  try {
    account = await evmlcDirectory.keystore.decryptAccount(
      evmlc.defaultFrom,
      password,
    );
    return account;
  } catch (error) {
    errorLog(error);
  }
};

const loadContract = async (contractName, filename) => {
  try {
    const compiled = await compile(contractName, filename);
    contract = await evmlc.contracts.load(compiled.abi, {
      data: compiled.bytecode,
    });
  } catch (error) {
    errorLog(error);
  }
};

const deploySmartContract = async () => {
  try {
    const response = await contract.deploy(account);
    return response;
  } catch (error) {
    errorLog(JSON.stringify(error));
  }
};

const setClaim = async (claimOwner, claimContent) => {
  try {
    const transaction = await contract.methods.setClaim(claimOwner, claimContent);
    await transaction.submit({}, account);
    const receipt = await transaction.receipt;
    return receipt;
  } catch (error) {
    errorLog(error);
  }
};

const getClaim = async (claimOwner) => {
  try {
    const transaction = await contract.methods.getClaim(claimOwner);
    const response = await transaction.submit({}, account);
    return response;
  } catch (error) {
    errorLog(error);
  }
};

const demo = async () => {
  // Step1
  initEVMConnection();
  console.log(
    'Step 1 ) \n'
    + 'At the very beginning, we specify the host of the EVM-Lite and our default account.\n'
    + `EVM-Lite Address : ${evmlc.host}\n`
    + `Default Account : ${evmlc.defaultFrom}\n`,
  );

  // Step2
  const evmlcDirectory = await assignEvmlcDirectory();
  console.log(
    'Step 2 ) \n'
    + 'The private keys reside directly on our own device, so we need to specify \n'
    + 'the location in order to decrypt the account later.\n'
    + `Default EVMLC Location : ${os.homedir()}/.evmlc\n`,
  );

  // Step3
  const password = 'password';
  await decryptAccount(password, evmlcDirectory);
  console.log(
    'Step 3 ) \n'
    + 'Get account from keystore and decrypt the account.\n'
    + 'Decrypt Account :',
  );
  console.log(account);

  // Step 4
  const contractName = 'claimHub';
  const filename = 'claimHub';
  await loadContract(contractName, filename);
  console.log(
    '\n'
    + 'Step 4 ) \n'
    + 'Compiled the Claimhub SmartContract. \n'
    + 'The contract was written in the high-level Solidity language which compiles \n'
    + 'down to EVM bytecode.'
    + 'Smart Contract Object : ',
  );
  console.log(contract);

  // Step 5
  const receipt = await deploySmartContract(account);
  console.log(
    '\n'
  + 'Step 5 ) \n'
  + 'To deploy the SmartContract we created an EVM transaction \n'
  + 'with a data field containing the bytecode. After going through consensus, the \n'
  + 'transaction is applied on every node, so every participant will run a copy of \n'
  + 'the same code with the same data.\n'
  + 'Receipt: ',
  );
  console.log(receipt.receipt);

  // Step 6
  const claimOwner = 'Junwei';
  const claimContent = 'SZ9BFDNKYEPJPFNTDZWLMAKNXBCDUFUIXUIKA9GRYPYTTNCNKEWBBVPJXMLD9QPOHRXHMPRKLSBGMIHRL';
  const setResponse = await setClaim(claimOwner, claimContent);
  console.log(
    '\n'
  + 'Step 6 ) \n'
  + 'We created an EVM transaction to call the setClaim method of the SmartContract. \n'
  + 'This will create a combination of claims in the contract, \n'
  + 'in this claim will explain the ownership of the claim and the corresponding content.\n'
  + 'Transaction Response : ',
  );
  console.log(setResponse);

  // Step 7
  const getResponse = await getClaim(claimOwner);
  console.log(
    '\n'
  + 'Step 7 ) \n'
  + `Junwei's claim content : ${getResponse}`,
  );
};

demo();

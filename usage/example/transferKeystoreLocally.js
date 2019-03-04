const { EVMLC } = require('evm-lite-lib');
const { DataDirectory } = require('evm-lite-lib');

// Transaction Addresses
const from = '';
const to = '';
const value = '';

// EVMLC object
const evmlc = new EVMLC('127.0.0.1', 8080, {
  from,
  gas: 100000,
  gasPrice: 0,
});

// Data directory object
const dataDirectory = new DataDirectory('');
const password = '';

const signTransactionLocally = async () => {
  // Get keystore object from the keystore directory and decrypt
  const account = await dataDirectory.keystore.decryptAccount(from, password);

  // Prepare a transaction
  const transaction = await evmlc.prepareTransfer(to, value);

  // Sign transaction and return the same Transaction object
  // Send transaction to node
  await transaction.submit({}, account);

  return transaction;
};

signTransactionLocally()
  .then(transaction => console.log(transaction.hash))
  .catch(error => console.log(error));

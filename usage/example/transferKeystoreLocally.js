const evmlib = require('evm-lite-lib');

// Transaction Addresses
const from = '';
const to = '';
const value = '';

// EVMLC object
const evmlc = new evmlib.EVMLC('127.0.0.1', 8080, {
  from,
  gas: 100000,
  gasPrice: 0,
});

// Data directory object
const dataDirectory = new evmlib.DataDirectory('');
const password = '';

const signTransactionLocally = async () => {
  // Get keystore object from the keystore directory and decrypt
  const account = await dataDirectory.keystore.decrypt(from, password);

  // Prepare a transaction with value of 2000
  const transaction = await evmlc.prepareTransfer(to, value);

  // Sign transaction and return the same Transaction object
  await transaction.sign(account);

  // Send transaction to node
  await transaction.submit();

  return transaction;
};

signTransactionLocally()
  .then(transaction => console.log(transaction.hash))
  .catch(error => console.log(error));

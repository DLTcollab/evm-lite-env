const evmlib = require('evm-lite-lib');

// Transaction Addresses
const from = '0xeb0d3811B16f792c119E6395141fa58f8409C597';
const to = '0xeF5D1019e5B752E993BA17EC3aD2B021872Fb969';

// EVMLC object
const evmlc = new evmlib.EVMLC('127.0.0.1', 8080, {
    gas: 100000,
    gasPrice: 0
});

// Keystore object
const keystore = new evmlib.Keystore('/Users/junwei/.evmlc', 'keystore');

async function signTransactionLocally() {
    const keystoreFile = await keystore.get(from);
    const decryptedAccount = evmlib.Account.decrypt(keystoreFile, 'superpassword');
    const transaction = await evmlc.prepareTransfer(to, 200, from);
    const signedTransaction = await decryptedAccount.signTransaction(transaction);
    return await transaction.sendRaw(signedTransaction.rawTransaction);
}

signTransactionLocally()
    .then((txResponse) => console.log(txResponse))
    .catch((error) => console.log(error));
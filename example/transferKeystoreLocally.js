const evmlib = require('evm-lite-lib');

// Transaction Addresses
const from = '0xeb0d3811B16f792c119E6395141fa58f8409C597';
const to = '0xeF5D1019e5B752E993BA17EC3aD2B021872Fb969';

// Transaction Value
const value = 200;

// Config evm-lite IP
const nodeIP = '127.0.0.1';

// Data directory object
const dataDirectory = new evmlib.DataDirectory('/Users/junwei.evmlc');

// Password for keystore
const password = 'superpassword';

// EVMLC object
const evmlc = new evmlib.EVMLC(nodeIP, 8080, {
    from,
    gas: 100000,
    gasPrice: 0
});

async function signTransactionLocally() {

    // Get keystore object from the keystore directory
    // For the from address so we can decrypt and sign
    const keystoreFile = await dataDirectory.keystore.get(from); 

    // Decrypt the v3JSONKeystore file so expose `sign` function
    const decryptedAccount = evmlib.Account.decrypt(keystoreFile, password);

    // Prepare a transaction
    const transaction = await evmlc.prepareTransfer(to, value);

    // Sign transaction and return a new Transaction object
    const signedTransaction = await decryptedAccount.signTransaction(transaction);

    return await transaction.sendRaw(signedTransaction.rawTransaction);
}

signTransactionLocally()
    .then((txResponse) => console.log(txResponse))
    .catch((error) => console.log(error));
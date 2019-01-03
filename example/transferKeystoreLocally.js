const evmlib = require('evm-lite-lib');

// Transaction Addresses
const from = '0xeF5D1019e5B752E993BA17EC3aD2B021872Fb969';
const to = '0x7268f80400074B8E891951302F6a82aE85D10A36';

// EVMLC object
const evmlc = new evmlib.EVMLC('127.0.0.1', 8080, {
    gas: 100000,
    gasPrice: 0
});

const transactionPrepare = evmlc.prepareTransfer(to, 200, from);

evmlc.getAccount(to)

.then((account) => {
    console.log('Account Before:\n', account, '\n\n')
    return transactionPrepare
})
.then((transaction) => transaction.send())
.then((receipt) => console.log('Transaction Receipt:\n', receipt, '\n\n'))
.then(() => evmlc.getAccount(to))
.then((account) => console.log('Account After:\n', account, '\n\n'))
.catch((error) => console.log('Error:\n',error));
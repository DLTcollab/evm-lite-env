util = require('util');
path = require("path");
JSONbig = require('json-bigint');
argv = require('minimist')(process.argv.slice(2));
prompt = require('prompt');
EVMBabbleClient = require('./evm-babble-client.js');
Contract = require('./contract-lite.js');
InvokeContract = require('./invoke.js')
Accounts = require('web3-eth-accounts');
fs = require('fs');
accounts = new Accounts('');

const address = '0xb0f2b8c033624f8248db59540a7e3987318cdfbc'
const abi = '[{"constant":true,"inputs":[],"name":"checkGoalReached","outputs":[{"name":"reached","type":"bool"},{"name":"beneficiary","type":"address"},{"name":"goal","type":"uint256"},{"name":"amount","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"settle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"contribute","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[{"name":"goal","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"beneficiary","type":"address"},{"indexed":false,"name":"funder","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"NewContribution","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"ok","type":"bool"}],"name":"Settlement","type":"event"}]'

//------------------------------------------------------------------------------

FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgCyan = "\x1b[36m"
FgWhite = "\x1b[37m"


log = function (color, text) {
    console.log(color + text + '\x1b[0m');
}

step = function (message) {
    log(FgWhite, '\n' + message)
    return new Promise((resolve) => {
        prompt.get('PRESS ENTER TO CONTINUE', function (err, res) {
            resolve();
        });
    })
}

explain = function (message) {
    log(FgCyan, util.format('\nEXPLANATION:\n%s', message))
}

space = function () {
    console.log('\n');
}

//------------------------------------------------------------------------------

sleep = function (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

//..............................................................................

function DemoNode(name, host, port) {
    this.name = name
    this.api = new EVMBabbleClient(host, port)
    this.accounts = {}
}

//------------------------------------------------------------------------------

var _demoNodes = [];
var _contractFile = 'crowd-funding.sol';
var _keystore = 'keystore';
var _pwdFile = 'pwd.txt';
var _wallet;
var _cfContract;

init = function () {
    console.log(argv);
    var ips = argv.ips.split(",");
    var port = argv.port;
    _contractFile = argv.contract;
    _keystore = argv.keystore;
    _pwdFile = argv.pwd;

    //_cfContract = new InvokeContract(abi);
    //_cfContract.w3_creation();
    //_cfContract.address = address;



    var keystoreArray = readKeyStore(_keystore);
    var pwd = readPassFile(_pwdFile);
    _wallet = accounts.wallet.decrypt(keystoreArray, pwd);

    return new Promise((resolve, reject) => {
        for (i = 0; i < ips.length; i++) {
            demoNode = new DemoNode(
                util.format('node%d', i + 1),
                ips[i],
                port);
            _demoNodes.push(demoNode);
        }
        resolve()
    });
}

readKeyStore = function (dir) {

    var keystore = []

    files = fs.readdirSync(dir)

    for (i = 0, len = files.length; i < len; ++i) {

        filepath = path.join(dir, files[i]);
        if (fs.lstatSync(filepath).isDirectory()) {
            filepath = path.join(filepath, files[i]);
        }
        keystore.push(JSON.parse(fs.readFileSync(filepath)));
    }

    return keystore;

}

readPassFile = function (path) {
    return fs.readFileSync(path, 'utf8');
}

getControlledAccounts = function () {
    log(FgMagenta, 'Getting Accounts')
    return Promise.all(_demoNodes.map(function (node) {
        return node.api.getAccounts().then((accs) => {
            log(FgGreen, util.format('%s accounts: %s', node.name, accs));
            node.accounts = JSONbig.parse(accs).accounts;
        });
    }));
}

transfer = function (from, to, amount) {
    tx = {
        from: from.accounts[0].address,
        to: to.accounts[0].address,
        value: amount
    }

    stx = JSONbig.stringify(tx)
    log(FgMagenta, 'Sending Transfer Tx: ' + stx)

    return from.api.sendTx(stx).then((res) => {
        log(FgGreen, 'Response: ' + res)
        txHash = JSONbig.parse(res).txHash.replace("\"", "")
        return txHash
    })
}

transferRaw = function (api, from, to, amount) {

    return api.getAccount(from.address).then((res) => {
            log(FgMagenta, 'account: ' + res)
            acc = JSONbig.parse(res);

            tx = {
                from: from.address,
                to: to,
                value: amount,
                nonce: acc.nonce,
                chainId: 1,
                gas: 1000000,
                gasPrice: 0
            }
            privateKey = from.privateKey;

            signedTx = accounts.signTransaction(tx, privateKey)
            console.log("signed tx", signedTx)

            return signedTx;
        })
        .then((signedTx) => api.sendRawTx(signedTx.rawTransaction))
        .then((res) => {
            log(FgGreen, 'Response: ' + res)
            txHash = JSONbig.parse(res).txHash.replace("\"", "")
            return txHash
        })

}

deployContract = function (from, contractFile, contractName, args) {
    contract = new Contract(contractFile, contractName)
    contract.compile()

    var constructorParams = contract.encodeConstructorParams(args)

    tx = {
        from: from.accounts[0].address,
        gas: 1000000,
        gasPrice: 0,
        data: contract.bytecode + constructorParams
    }

    stx = JSONbig.stringify(tx)
    log(FgMagenta, 'Sending Contract-Creation Tx: ' + stx)

    return from.api.sendTx(stx).then((res) => {
            log(FgGreen, 'Response: ' + res)
            txHash = JSONbig.parse(res).txHash.replace("\"", "")
            return txHash
        })
        .then((txHash) => {
            return sleep(2000).then(() => {
                log(FgBlue, 'Requesting Receipt')
                return from.api.getReceipt(txHash)
            })
        })
        .then((receipt) => {
            log(FgGreen, 'Tx Receipt: ' + receipt)
            address = JSONbig.parse(receipt).contractAddress
            contract.address = address
            log(FgRed, 'Contract Address: ' + contract.address)
            log(FgRed, 'Contract abi: ' + contract.abi)
            //console.log(util.inspect(contract, {showHidden: false, depth: null}))
            //fs.writeFile('abi',util.inspect(contract, {showHidden: false, depth: null}))
            return contract
        })
}


//------------------------------------------------------------------------------

contribute = function (from, wei_amount) {
    callData = _cfContract.w3.contribute.getData();
    log(FgMagenta, util.format('contribute() callData: %s', callData))

    tx = {
        from: from.accounts[0].address,
        to: _cfContract.address,
        gaz: 1000000,
        gazPrice: 0,
        value: wei_amount,
        data: callData
    }
    stx = JSONbig.stringify(tx)
    log(FgBlue, 'Sending Contract-Method Tx: ' + stx)

    return from.api.sendTx(stx).then((res) => {
            log(FgGreen, 'Response: ' + res)
            txHash = JSONbig.parse(res).txHash.replace("\"", "")
            return txHash
        })
        .then((txHash) => {
            return sleep(2000).then(() => {
                log(FgBlue, 'Requesting Receipt')
                return from.api.getReceipt(txHash)
            })
        })
        .then((receipt) => {
            log(FgGreen, 'Tx Receipt: ' + receipt)

            recpt = JSONbig.parse(receipt)

            logs = _cfContract.parseLogs(recpt.logs)
            logs.map(item => {
                log(FgCyan, item.event + ': ' + JSONbig.stringify(item.args))
            })
        })
}

checkGoalReached = function (from) {
    callData = _cfContract.w3.checkGoalReached.getData();
    log(FgMagenta, util.format('checkGoalReached() callData: %s', callData))

    tx = {
        from: from.accounts[0].address,
        value: 0,
        to: _cfContract.address,
        data: callData
    }
    stx = JSONbig.stringify(tx)
    log(FgBlue, 'Calling Contract Method: ' + stx)
    return from.api.call(stx).then((res) => {
        res = JSONbig.parse(res)
        log(FgBlue, 'res: ' + res.data)
        hexRes = Buffer.from(res.data).toString()

        unpacked = _cfContract.parseOutput('checkGoalReached', hexRes)

        log(FgGreen, 'Parsed res: ' + unpacked.toString())
    })
}

settle = function (from) {
    callData = _cfContract.w3.settle.getData();
    log(FgMagenta, util.format('settle() callData: %s', callData))

    tx = {
        from: from.accounts[0].address,
        to: _cfContract.address,
        gaz: 1000000,
        gazPrice: 0,
        value: 0,
        data: callData
    }
    stx = JSONbig.stringify(tx)
    log(FgBlue, 'Sending Contract-Method Tx: ' + stx)

    return from.api.sendTx(stx).then((res) => {
            log(FgGreen, 'Response: ' + res)
            txHash = JSONbig.parse(res).txHash.replace("\"", "")
            return txHash
        })
        .then((txHash) => {
            return sleep(2000).then(() => {
                log(FgBlue, 'Requesting Receipt')
                return from.api.getReceipt(txHash)
            })
        })
        .then((receipt) => {
            log(FgGreen, 'Tx Receipt: ' + receipt)

            recpt = JSONbig.parse(receipt)

            logs = _cfContract.parseLogs(recpt.logs)
            logs.map(item => {
                log(FgCyan, item.event + ': ' + JSONbig.stringify(item.args))
            })
        })
}

//------------------------------------------------------------------------------
// DEMO

prompt.start()
prompt.message = ''
prompt.delimiter = ''

init()

    .then(() => step("STEP 1) Get ETH Accounts"))
    .then(() => {
        space();
        return getControlledAccounts()
    })

    .then(() => step("STEP 2) Contribute 499 wei from node 2"))
    .then(() => {
        space();
        return contribute(_demoNodes[1], 499)
    })

    .then(() => step("STEP 3) Check goal reached"))
    .then(() => {
        space();
        return checkGoalReached(_demoNodes[0])
    })

    .then(() => step("STEP 4) Contribute 501 wei from node 3"))
    .then(() => {
        space();
        return contribute(_demoNodes[2], 501)
    })

    .then(() => step("STEP 5) Check goal reached"))
    .then(() => {
        space();
        return checkGoalReached(_demoNodes[0])
    })

    .then(() => step("STEP 6) Settle"))
    .then(() => {
        space();
        return (_demoNodes[0])
    })

    .then(() => step("STEP 7) Check balances again"))
    .then(() => {
        space();
        return getControlledAccounts()
    })

    .catch((err) => log(FgRed, err))

//------------------------------------------------------------------------------
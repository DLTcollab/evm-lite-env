const util = require('util')
const path = require('path')
const JSONbig = require('json-bigint')
const argv = require('minimist')(process.argv.slice(2))
const prompt = require('prompt')
const EVMBabbleClient = require('../deploy/evm-babble-client.js')
const InteractContract = require('../interact/interact.js')
const Accounts = require('web3-eth-accounts')
const fs = require('fs')

const accounts = new Accounts('')
const address = '0x8c92fe8af1f3fdcec115938830ea5428de3744e5'
const abi = '[{"constant":true,"inputs":[],"name":"checkGoalReached","outputs":[{"name":"reached","type":"bool"},{"name":"beneficiary","type":"address"},{"name":"goal","type":"uint256"},{"name":"amount","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"settle","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"contribute","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[{"name":"goal","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"beneficiary","type":"address"},{"indexed":false,"name":"funder","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"NewContribution","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"ok","type":"bool"}],"name":"Settlement","type":"event"}]'

//------------------------------------------------------------------------------

const FgRed = '\x1b[31m'
const FgGreen = '\x1b[32m'
const FgBlue = '\x1b[34m'
const FgMagenta = '\x1b[35m'
const FgCyan = '\x1b[36m'


const log = function (color, text) {
    console.log(color + text + '\x1b[0m')
}
//------------------------------------------------------------

const sleep = function (time) {
    return new Promise((resolve) => setTimeout(resolve, time))
}

//..............................................................................

function DemoNode(name, host, port) {
    this.name = name
    this.api = new EVMBabbleClient(host, port)
    this.accounts = {}
}

//------------------------------------------------------------------------------

let _demoNodes = []
let _contractFile = 'crowd-funding.sol'
let _keystore = 'keystore'
let _pwdFile = 'pwd.txt'
let _wallet
let _cfContract

const init = function () {
    console.log(argv)
    const ips = argv.ips.split(',')
    const port = argv.port
    _contractFile = argv.contract
    _keystore = argv.keystore
    _pwdFile = argv.pwd

    _cfContract = new InteractContract(abi)
    _cfContract.w3_creation()
    _cfContract.address = address

    const keystoreArray = readKeyStore(_keystore)
    const pwd = readPassFile(_pwdFile)
    _wallet = accounts.wallet.decrypt(keystoreArray, pwd)

    return new Promise((resolve) => {
        for (let i = 0; i < ips.length; i++) {
            let demoNode = new DemoNode(
                util.format('node%d', i + 1),
                ips[i],
                port)
            _demoNodes.push(demoNode)
        }
        resolve()
    })
}

const readKeyStore = function (dir) {

    const keystore = []

    const files = fs.readdirSync(dir)

    for (let i = 0, len = files.length; i < len; ++i) {

        let filepath = path.join(dir, files[i])
        if (fs.lstatSync(filepath).isDirectory()) {
            filepath = path.join(filepath, files[i])
        }
        keystore.push(JSON.parse(fs.readFileSync(filepath)))
    }

    return keystore

}

const readPassFile = function (path) {
    return fs.readFileSync(path, 'utf8')
}

const getControlledAccounts = function () {
    log(FgMagenta, 'Getting Accounts')
    return Promise.all(_demoNodes.map(function (node) {
        return node.api.getAccounts().then((accs) => {
            log(FgGreen, util.format('%s accounts: %s', node.name, accs))
            node.accounts = JSONbig.parse(accs).accounts
        })
    }))
}

//------------------------------------------------------------------------------

const contribute = function (from, wei_amount) {
    const callData = _cfContract.w3.contribute.getData()
    log(FgMagenta, util.format('contribute() callData: %s', callData))

    const tx = {
        from: from.accounts[0].address,
        to: _cfContract.address,
        gaz: 1000000,
        gazPrice: 0,
        value: wei_amount,
        data: callData
    }
    const stx = JSONbig.stringify(tx)
    log(FgBlue, 'Sending Contract-Method Tx: ' + stx)

    return from.api.sendTx(stx).then((res) => {
        log(FgGreen, 'Response: ' + res)
        const txHash = JSONbig.parse(res).txHash.replace('\'', '')
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

            const recpt = JSONbig.parse(receipt)

            const logs = _cfContract.parseLogs(recpt.logs)
            logs.map(item => {
                log(FgCyan, item.event + ': ' + JSONbig.stringify(item.args))
            })
        })
}

const checkGoalReached = function (from) {
    const callData = _cfContract.w3.checkGoalReached.getData()
    log(FgMagenta, util.format('checkGoalReached() callData: %s', callData))

    const tx = {
        from: from.accounts[0].address,
        value: 0,
        to: _cfContract.address,
        data: callData
    }
    const stx = JSONbig.stringify(tx)
    log(FgBlue, 'Calling Contract Method: ' + stx)
    return from.api.call(stx).then((res) => {
        res = JSONbig.parse(res)
        log(FgBlue, 'res: ' + res.data)
        const hexRes = Buffer.from(res.data).toString()

        const unpacked = _cfContract.parseOutput('checkGoalReached', hexRes)

        log(FgGreen, 'Parsed res: ' + unpacked.toString())
    })
}

const settle = function (from) {
    const callData = _cfContract.w3.settle.getData()
    log(FgMagenta, util.format('settle() callData: %s', callData))

    const tx = {
        from: from.accounts[0].address,
        to: _cfContract.address,
        gaz: 1000000,
        gazPrice: 0,
        value: 0,
        data: callData
    }
    const stx = JSONbig.stringify(tx)
    log(FgBlue, 'Sending Contract-Method Tx: ' + stx)

    return from.api.sendTx(stx).then((res) => {
        log(FgGreen, 'Response: ' + res)
        const txHash = JSONbig.parse(res).txHash.replace('\'', '')
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

            const recpt = JSONbig.parse(receipt)

            const logs = _cfContract.parseLogs(recpt.logs)
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

    .then(() => {
        console.log('\nSTEP 1) Get ETH Accounts')
        return getControlledAccounts()
    })

    .then(() => {
        console.log('\nSTEP 2) Contribute 499 wei from node 2')
        return contribute(_demoNodes[1], 499)
    })

    .then(() => {
        console.log('\nSTEP 3) Check goal reached')
        return checkGoalReached(_demoNodes[0])
    })

    .then(() => {
        console.log('\nSTEP 4) Contribute 501 wei from node 3')
        return contribute(_demoNodes[2], 501)
    })

    .then(() => {
        console.log('\nSTEP 5) Check goal reached')
        return checkGoalReached(_demoNodes[0])
    })

    .then(() => {
        console.log('\nSTEP 6) Settle')
        return settle(_demoNodes[0])
    })

    .then(() => {
        console.log('\nSTEP 7) Check balances again')
        return getControlledAccounts()
    })

    .catch((err) => log(FgRed, err))

//------------------------------------------------------------------------------
const util = require('util')
const path = require('path')
const JSONbig = require('json-bigint')
const prompt = require('prompt')
const EVMBabbleClient = require('./evm-babble-client.js')
const Contract = require('./contract-lite.js')
const Accounts = require('web3-eth-accounts')
const program = require('commander')
const fs = require('fs')

let contract
let accounts = new Accounts('')

//------------------------------------------------------------------------------

const sleep = function (time) {
    return new Promise((resolve) => setTimeout(resolve, time))
}

//------------------------------------------------------------------------------

function DemoNode(name, host, port) {
    this.name = name
    this.api = new EVMBabbleClient(host, port)
    this.accounts = {}
}

//------------------------------------------------------------------------------

let _demoNodes = []
let _keystore = ''
let _pwdFile = ''
let _contractName = ''
let _contractFile = ''
let _wallet
//------------------------------------------------------------------------------

program
    .option('--ips <value>')
    .option('--port <value>')
    .option('--contractName <value>')
    .option('--contractPath <value>')
    .option('--keystore <value>')
    .option('--pwd <value>')
    .parse(process.argv)

//WIP---------------------------------------------------------------------------

function deploy_contract(ips, port, contractName, contractPath, keystore, pwd) {
    this.ips = ips
    this.port = port
    this.contractName = contractName
    this.contractPath = contractPath
    this.keystore = keystore
    this.pwd = pwd
}

//------------------------------------------------------------------------------
const init = function () {
    let ips = readIpsStore(program.ips)
    let port = program.port
    _contractName = program.contractName
    _contractFile = program.contractPath
    _keystore = program.keystore
    _pwdFile = program.pwd

    let keystoreArray = readKeyStore(_keystore)
    let pwd = readPassFile(_pwdFile)
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

const readIpsStore = function () {
    let fs = require('fs')
    let contents = fs.readFileSync('../terraform/local/ips.dat', 'utf8')
    let re = /(\d+\.\d+\.\d+\.\d+)/gm
    let found = contents.match(re)

    return found
}

const readKeyStore = function (dir) {

    let keystore = []

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
    return Promise.all(_demoNodes.map(function (node) {
        return node.api.getAccounts().then((accs) => {
            node.accounts = JSONbig.parse(accs).accounts
        })
    }))
}

const deployContract = function (from, contractFile, contractName, args) {
    let contract = new Contract(contractFile, contractName)
    contract.compile()

    let constructorParams = contract.encodeConstructorParams(args)

    const tx = {
        from: from.accounts[0].address,
        gas: 1000000,
        gasPrice: 0,
        data: contract.bytecode + constructorParams
    }

    const stx = JSONbig.stringify(tx)

    return from.api.sendTx(stx).then((res) => {
        const txHash = JSONbig.parse(res).txHash.replace('\'', '')
        return txHash
    })
        .then((txHash) => {
            return sleep(2000).then(() => {
                return from.api.getReceipt(txHash)
            })
        })
        .then((receipt) => {
            const address = JSONbig.parse(receipt).contractAddress
            contract.address = address
            console.log('ABI : \n' + contract.abi + '\nSmart Contract Address : \n' + contract.address)
            return contract
        })

}
//------------------------------------------------------------------------------

prompt.start()
prompt.message = ''
prompt.delimiter = ''

init()

    .then(() => {
        return getControlledAccounts()
    })

    .then(() => {
        return deployContract(_demoNodes[0], _contractFile, _contractName, [1000])
    })
    .then(() => {
        return new Promise((resolve) => {
            resolve()
        })
    })

    .then(() => {
        
    })

    .catch((err) => console.log(err))
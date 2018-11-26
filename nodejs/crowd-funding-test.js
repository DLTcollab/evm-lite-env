util = require('util');
path = require("path");
JSONbig = require('json-bigint');
prompt = require('prompt');
EVMBabbleClient = require('./evm-babble-client.js');
Contract = require('./contract-lite.js');
Accounts = require('web3-eth-accounts');
var accounts = new Accounts('');

//------------------------------------------------------------------------------

FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgCyan = "\x1b[36m"
FgWhite = "\x1b[37m"

log = function(color, text){
    console.log(color+text+'\x1b[0m');
}

space = function(){
    console.log('\n');
}

//------------------------------------------------------------------------------

sleep = function(time) {
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
var _cfContract;
var _keystore = '';
var _pwdFile = '';
var _contractName = '';
var _contractFile = '';
var _wallet;
var argv;
var program = require('commander');

//------------------------------------------------------------------------------

program
  .option('--ips <value>',)
  .option('--port <value>',)
  .option('--contractName <value>')
  .option('--contractPath <value>')
  .option('--contractAddress <value>')
  .option('--keystore <value>')
  .option('--pwd <value>')
  .parse(process.argv);

//------------------------------------------------------------------------------

init = function() {
    var ips = program.ips.split(",");
    var port = program.port;
    var _contractName = program.contractName;
    var _contractFile = program.contractPath;
    var _contractAddress = program.contractAddress;
    _keystore = program.keystore;
    _pwdFile = program.pwd;

    _cfContract = new Contract(_contractFile, _contractName);
    _cfContract.compile();
    _cfContract.address = _contractAddress;

    var keystoreArray = readKeyStore(_keystore);
    var pwd = readPassFile(_pwdFile);
    _wallet = accounts.wallet.decrypt(keystoreArray, pwd);

    return new Promise((resolve, reject) => {
        for (i=0; i<ips.length; i++) {
            demoNode = new DemoNode(
                util.format('node%d', i+1),
                ips[i], 
                port);   
            _demoNodes.push(demoNode);
        }
        resolve()
    });
}

readKeyStore = function(dir) {

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

readPassFile = function(path) {
    return fs.readFileSync(path, 'utf8');
}

getControlledAccounts = function() {
    return Promise.all(_demoNodes.map(function (node) {
        return  node.api.getAccounts().then((accs) => {
            log(FgGreen, util.format('%s accounts: %s', node.name, accs));
            node.accounts = JSONbig.parse(accs).accounts;
        });
    }));
}
//------------------------------------------------------------------------------

contribute = function(from, wei_amount) {
    callData = _cfContract.w3.contribute.getData();

    tx = {
        from: from.accounts[0].address,
        to: _cfContract.address,
        gaz:1000000,
        gazPrice:0,
        value:wei_amount,
        data: callData
    }
    stx = JSONbig.stringify(tx)
    log(FgBlue, 'Sending Contract-Method Tx: ' + stx)
    
    return from.api.sendTx(stx).then( (res) => {
        log(FgGreen, 'Response: ' + res)
        txHash = JSONbig.parse(res).txHash.replace("\"", "")
        return txHash
    })
    .then( (txHash) => {
        return sleep(2000).then(() => {
            log(FgBlue, 'Requesting Receipt')
            return from.api.getReceipt(txHash)
        })
    }) 
    .then( (receipt) => {
        
        recpt = JSONbig.parse(receipt)
        
        logs = _cfContract.parseLogs(recpt.logs)
        logs.map( item => {
            log(FgCyan, item.event + ': ' + JSONbig.stringify(item.args))
        })
    })
}

checkGoalReached = function(from) {
    callData = _cfContract.w3.checkGoalReached.getData();

    tx = {
        from: from.accounts[0].address,
        value:0,
        to: _cfContract.address,
        data: callData
    }
    stx = JSONbig.stringify(tx)
    return from.api.call(stx).then( (res) => {
        res = JSONbig.parse(res)
        hexRes = Buffer.from(res.data).toString()

        unpacked = _cfContract.parseOutput('checkGoalReached', hexRes)

        log(FgGreen, 'Parsed res: ' + unpacked.toString())
    })
}

settle = function(from) {
    callData = _cfContract.w3.settle.getData();

    tx = {
        from: from.accounts[0].address,
        to: _cfContract.address,
        gaz:1000000,
        gazPrice:0,
        value:0,
        data: callData
    }
    stx = JSONbig.stringify(tx)
    log(FgBlue, 'Sending Contract-Method Tx: ' + stx)
    
    return from.api.sendTx(stx).then( (res) => {
        txHash = JSONbig.parse(res).txHash.replace("\"", "")
        return txHash
    })
    .then( (txHash) => {
        return sleep(2000).then(() => {
            return from.api.getReceipt(txHash)
        })
    }) 
    .then( (receipt) => {
        recpt = JSONbig.parse(receipt)
        
        logs = _cfContract.parseLogs(recpt.logs)
        logs.map( item => {
            log(FgCyan, item.event + ': ' + JSONbig.stringify(item.args))
        })
    })
}

//------------------------------------------------------------------------------

prompt.start()
prompt.message = ''
prompt.delimiter =''

init()

.then(() => {space(); console.log("STEP 1) Get ETH Accounts")})
.then(() => {return getControlledAccounts()})

.then(() => {space(); console.log("STEP 2) Contribute 499 wei from node 2")})
.then(() => {return contribute(_demoNodes[1], 499)})

.then(() => {space(); console.log("STEP 3) Check goal reached")})
.then(() => {return checkGoalReached(_demoNodes[0])})

.then(() => {space(); console.log("STEP 4) Contribute 501 wei from node 3")})
.then(() => {return contribute(_demoNodes[2], 501)})

.then(() => {space(); console.log("STEP 5) Check goal reached")})
.then(() => {return checkGoalReached(_demoNodes[0])})

.then(() => {space(); console.log("STEP 6) Settle")})
.then(() => {return settle(_demoNodes[0])})

.then(() => {space(); console.log("STEP 7) Check balances again")})
.then(() => {return getControlledAccounts()})

.catch((err) => log(FgRed, err))

//------------------------------------------------------------------------------


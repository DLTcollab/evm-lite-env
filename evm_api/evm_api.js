const fs = require('fs')
const express = require('express')
const multer = require('multer')
const request = require('request')
const InvokeContract = require('./invoke.js')
const exec = require("child_process").exec;
const app = express()

contract_storage_path = './contract_file/'
let _cfContract

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, contract_storage_path)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage: storage
})

// Deploy Contract
app.post('/contract_upload', upload.single('contract'), function (req, res, next) {
    const file = req.file
    const mode = 'babble'
    const ips = '\"../terraform/ips.dat\"'
    const port = '\"8080\"'
    const contract_name = '\"' + file.originalname.split('.')[0] + '\"'
    const contract_path = '\"' + './contract_file/' + file.originalname + '\"'
    const keystore = '\"' + '../conf/' + mode + '/conf/keystore' + '\"'
    const pwd = '\"' + '../conf/eth/pwd.txt' + '\"'
    
    const deploy_command = 'node ./deploy.js' +
        ' --ips=' + ips +
        ' --port=' + port +
        ' --contractName=' + contract_name +
        ' --contractPath=' + contract_path +
        ' --keystore=' + keystore +
        ' --pwd=' + pwd
        
    console.log(deploy_command)

    exec(deploy_command, function (error, stdout, stderr) {
        if (error) {
            console.log(error)
            res.send(error)
        } else if (stderr) {
            console.log(stderr)
            res.send(stderr)
        } else if (stdout) {
            console.log("Deploy Secessful !!")
            console.log(stdout)
            res.send(stdout)
        }
    });
})

// Invoke exist smart contract
app.post('/invoke/:address/:abi', function (req, res, next) {
    const contract_address = (req.param.address)
    console.log(contract_address)
    const contract_abi = (req.param.abi)
    console.log(contract_abi)

    _cfContract = new InvokeContract(contract_abi)
    _cfContract.w3_creation()
    _cfContract.address = contract_address

    res.send(_cfContract)
})

app.listen(3000)

// Get Accounts amount
app.post('/getAccounts/:nodeip', function (req, res, next) {
    const nodeip = 'http://' + (req.params.nodeip) + ':8080/accounts'
    request(nodeip, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
            res.send(body);
        }
    })
})

// Send Transfer
app.post('/:nodeip/:from/:to/:value', function (req, res) {
    const nodeip = `http://${req.params.nodeip}:8080/tx`;
    const data = {
        "from": req.params.from,
        "to": req.params.to,
        "value": parseInt(req.params.value)
    }
    request.post({
        url: nodeip,
        body: JSON.stringify(data)
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json(body);
        }
    })
});

// Contract upload page
app.get('/deploy', function (req, res, next) {
    const deploy_web = fs.readFileSync('./deploy.html', {
        encoding: 'utf8'
    })
    res.send(deploy_web)
})

app.listen(3000)
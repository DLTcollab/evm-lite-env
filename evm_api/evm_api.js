const fs = require('fs')
const express = require('express')
const multer = require('multer')
const request = require('request')
const exec = require("child_process").exec;
const app = express()

contract_storage_path = './contract_file/'

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
    const contract_path = '\"' + '../evm_api/contract_file/' + file.originalname + '\"'
    const keystore = '\"' + '../conf/' + mode + '/conf/keystore' + '\"'
    const pwd = '\"' + '../conf/eth/pwd.txt' + '\"'
    
    const deploy_command = 'node ../nodejs/deploy_smartcontract.js' +
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
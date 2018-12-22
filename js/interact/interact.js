const JSONbig = require('json-bigint')
const Web3 = require('web3')
const SolidityFunction = require('web3/lib/web3/function.js')
const SolidityEvent = require('web3/lib/web3/event.js')

const web3 = new Web3()

function interact_contract(abi) {
    this.abi = abi
}

interact_contract.prototype.w3_creation = function () {
    this.w3 = web3.eth.contract(JSONbig.parse(this.abi)).at('')
}

interact_contract.prototype.parseOutput = function (funcName, output) {
    const funcDef = this.w3.abi.find(function (json) {
        return json.type === 'function' && json.name === funcName
    })
    const func = new SolidityFunction(this.w3._eth, funcDef, '')
    return func.unpackOutput(output)
}

interact_contract.prototype.parseLogs = function (logs) {
    let c = this
    let decoders = c.w3.abi.filter(function (json) {
        return json.type === 'event'
    }).map(function (json) {
        return new SolidityEvent(null, json, null)
    })

    return logs.map(function (log) {
        let decoder = decoders.find(function (decoder) {
            return (decoder.signature() == log.topics[0].replace('0x', ''))
        })
        if (decoder) {
            return decoder.decode(log)
        } else {
            return log
        }
    }).map(function (log) {
        let abis = c.w3.abi.find(function (json) {
            return (json.type === 'event' && log.event === json.name)
        })
        if (abis && abis.inputs) {
            abis.inputs.forEach(function (param) {
                if (param.type == 'bytes32') {
                    log.args[param.name] = toAscii(log.args[param.name])
                }
            })
        }
        return log
    }).map(function (log) {
        return log
    })
}

module.exports = interact_contract
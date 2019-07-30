var Chain3 = require('chain3');
var fs = require('fs');
var solc = require('solc');
var path = require('path');
var logger = require('./logger');
var nconf = require('nconf');
// const ws = require('./wss').ws

nconf.file({ file: path.resolve(__dirname, "../../initConfig.json") });
const baseaddr = nconf.get("baseaddr");
const minScsDeposit = nconf.get("minScsDeposit");
const vnodeUri = nconf.get("vnodeUri");
const privatekey = nconf.get("privatekey");

var chain3 = new Chain3();
chain3.setProvider(new chain3.providers.HttpProvider(vnodeUri));

if (!chain3.isConnected()) {
    throw new Error('unable to connect to moac vnode at ' + vnodeUri);
} else {
    logger.info('connected to moac vnode at ' + vnodeUri);
}

//===============Common Utils=======================================
// function sendtx(src, tgtaddr, amount, strData) {

//     var transHash = chain3.mc.sendTransaction(
//         {
//             from: src,
//             value: chain3.toSha(amount, 'mc'),
//             to: tgtaddr,
//             gas: "2000000",
//             gasPrice: chain3.mc.gasPrice,
//             data: strData
//         });

//     logger.info('sending from:' + src + ' to:' + tgtaddr + ' amount:' + amount + ' with data:' + strData);
//     waitBlockForTransaction(transHash);
// }

function sendtx(src, tgtaddr, amount, strData) {

    let rawTx = {
        nonce: chain3.toHex(getNonce(src)),
        value: chain3.toHex(chain3.toSha(amount, 'mc')),
        to: tgtaddr,
        gasLimit: chain3.toHex("2000000"),
        gasPrice: chain3.toHex(chain3.mc.gasPrice),
        chainId: chain3.toHex(chain3.version.network),
        data: strData
    };
    let signtx = chain3.signTransaction(rawTx, privatekey);
    var transHash = chain3.mc.sendRawTransaction(signtx);
    logger.info('sending from:' + src + ' to:' + tgtaddr + ' amount:' + amount + ' with data:' + strData);
    return waitBlockForTransaction(transHash);
}

function getNonce(src) {
    var count = chain3.mc.getTransactionCount(src);
    var res = chain3.currentProvider.send({
        id: new Date().getTime(),
        jsonrpc: "2.0",
        method: "txpool_content",
        params: []
    });
    if (res && res.result && res.result.pending) {
        var pendings = res.result.pending;
        if (pendings) {
            const keys = Object.keys(pendings);
            for (const index in keys) {
                /* istanbul ignore else  */
                if (keys.hasOwnProperty(index)) {
                    const key = keys[index];
                    if (key.toLowerCase() === src.toLowerCase()) {
                        count = count + Object.keys(pendings[key]).length;
                    }
                }
            }
        }
    }
    return count;
}

function checkBalance(inaddr, inMcAmt) {
    if (chain3.mc.getBalance(inaddr) / 1e18 >= inMcAmt) {
        return true;
    } else {
        return false;
    }
}

function refreshInitConfig() {
    nconf.file({ file: path.resolve(__dirname, "../../initConfig.json") });
}

function waitBalance(addr, target) {
    while (true) {
        let balance = chain3.mc.getBalance(addr) / 1000000000000000000;
        if (balance >= target) {
            logger.info("account has enough balance " + balance);
            break;
        }
        logger.info("Waiting the account has enough balance " + balance);
        sleep(5000);
    }
}

// wait certain blocks for the contract to be mined
function waitForBlocks(innum) {
    let startBlk = chain3.mc.blockNumber;
    let preBlk = startBlk;
    logger.info("Waiting for blocks to confirm the contract... currently in block " + startBlk);
    while (true) {
        let curblk = chain3.mc.blockNumber;
        if (curblk > startBlk + innum) {
            logger.info("Waited for " + innum + " blocks!");
            break;
        }
        if (curblk > preBlk) {
            logger.info("Waiting for blocks to confirm the contract... currently in block " + curblk);
            preBlk = curblk;
        } else {
            logger.info("...");
        }

        sleep(8000);
    }
}

function waitBlockForContract(transactionHash) {
    logger.info("Waiting a mined block to include your contract...");

    while (true) {
        let receipt = chain3.mc.getTransactionReceipt(transactionHash);
        if (receipt && chain3.fromDecimal(receipt.status) == 1 && receipt.contractAddress) {
            logger.info("contract has been deployed at " + receipt.contractAddress);
            break;
        } else if (receipt && chain3.fromDecimal(receipt.status) == 0) {
            logger.info("contract deploy failed!!!");
            break;
        }
        logger.info("block " + chain3.mc.blockNumber + "...");
        sleep(50000);
    }
    return chain3.mc.getTransactionReceipt(transactionHash).contractAddress;
}


function waitBlockForTransaction(transactionHash) {
    logger.info("Waiting a mined block to include ", transactionHash);

    while (true) {
        let receipt = chain3.mc.getTransactionReceipt(transactionHash);
        if (receipt && chain3.fromDecimal(receipt.status) == 1) {
            logger.info("transaction successfully!");
            break;
        } else if (receipt && chain3.fromDecimal(receipt.status) == 0) {
            logger.info("transaction failed!");
            return false;
        }
        logger.info("block " + chain3.mc.blockNumber + "...");
        sleep(50000);
    }
}

function unlockAccount(baseaddr, basepsd) {
    // Unlock the baseaddr for contract deployment
    if (chain3.personal.unlockAccount(baseaddr, basepsd, 0)) {
        logger.info(`${baseaddr} is unlocked`);
    } else {
        logger.info(`unlock failed, ${baseaddr}`);
        throw new Error('unlock failed ' + baseaddr);
    }
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

//===============SCS Utils=======================================
function deployscspoolWithAddr() {

    contractName = 'SubChainProtocolBase';
    solpath = path.resolve(__dirname, "../contract/") + "/" + contractName + '.sol';

    contract = fs.readFileSync(solpath, 'utf8');

    output = solc.compile(contract, 1);

    abi = output.contracts[':' + contractName].interface;
    bin = output.contracts[':' + contractName].bytecode;

    var subchainprotocolbaseContract = chain3.mc.contract(JSON.parse(abi));
    logger.info(path.resolve(__dirname, "../contract.json"))
    var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../contract.json"), 'utf8'));
    logger.info(config.data[1]['scsPoolAddr']);
    scsPool = subchainprotocolbaseContract.at(config.data[1]['scsPoolAddr']);
    logger.info("scsPool created at address:", scsPool.address);
    return scsPool;
}

function deployMicroChainWithAddr() {

    var contractName = 'SubChainBase';

    // Need to read both contract files to compile
    var input = {
        '': fs.readFileSync(path.resolve(__dirname, "../contract/") + "/" + 'SubChainBase.sol', 'utf8'),
        'SubChainProtocolBase.sol': fs.readFileSync(path.resolve(__dirname, "../contract/") + "/" + 'SubChainProtocolBase.sol', 'utf8')
    };

    var output = solc.compile({ sources: input }, 1);

    abi = output.contracts[':' + contractName].interface;
    bin = output.contracts[':' + contractName].bytecode;

    // logger.info("SubChainBase abi:", abi);
    var subchainbaseContract = chain3.mc.contract(JSON.parse(abi));
    var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../contract.json"), 'utf8'));
    microChain = subchainbaseContract.at(config.data[2]['microChainAddr']);
    logger.info("microChain created at address:", microChain.address);
    return microChain;
}

function registerScsToPool(proto, num, scs) {
    if (num >= minScsDeposit) {
        for (var i = 0; i < scs.length; i++) {
            sendtx(baseaddr, proto, num, '0x4420e486000000000000000000000000' + scs[i].substr(2, 100));
        }
    } else {
        logger.info("Cannot register SCSs with not enough deposit!", num);
    }

}

//Open the MicroChain register process
function registerOpen(subchainaddr) {
    logger.info("registerOpen", subchainaddr);
    sendtx(baseaddr, subchainaddr, '0', '0x5defc56c');
}

//Close the MicroChain register process
function registerClose(subchainaddr) {
    logger.info("registerClose", subchainaddr);
    sendtx(baseaddr, subchainaddr, '0', '0x69f3576f');
}

// must do before flush
function addMicroChainFund(inaddr, num) {
    logger.info("addFund", inaddr);
    sendtx(baseaddr, inaddr, num, '0xa2f09dfa')
}

// vnoderegister(viaAddress, 1, "127.0.0.1:50062")
// vnodeprotocolbase.vnodeCount()
// vnode - vnode contract object with register function, and address
// num - deposit for VNODE to join the VNODE pool
// data - VNODE register FUNCTION
function vnoderegister(vnode, num, ip, via, rpcLink) {
    var data = vnode.register.getData(vnode.address, via, ip, rpcLink)
    logger.info("Registering VNODE ......")
    sendtx(baseaddr, vnode.address, num, data)
}

module.exports = {
    sendtx,
    getNonce: getNonce,
    checkBalance,
    waitBalance,
    waitForBlocks,
    waitBlockForContract,
    waitBlockForTransaction,
    unlockAccount,
    sleep,
    deployscspoolWithAddr,
    deployMicroChainWithAddr,
    registerScsToPool,
    registerOpen,
    registerClose,
    addMicroChainFund,
    vnoderegister,
    chain3,
    nconf,
    refreshInitConfig
}
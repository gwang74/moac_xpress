const Chain3 = require('chain3');
const fs = require('fs');
const solc = require('solc');
const path = require('path');

const initConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../initConfig.json"), 'utf8'));
const baseaddr = initConfig["baseaddr"];
const minScsDeposit = initConfig["minScsDeposit"];
const vnodeUri = initConfig["vnodeUri"];

let chain3 = new Chain3();
chain3.setProvider(new chain3.providers.HttpProvider(vnodeUri));

if (!chain3.isConnected()) {
    throw new Error('unable to connect to moac vnode at ' + vnodeUri);
} else {
    console.log('connected to moac vnode at ' + vnodeUri);
}

//===============Common Utils=======================================
function sendtx(src, tgtaddr, amount, strData) {

    var transHash = chain3.mc.sendTransaction(
        {
            from: src,
            value: chain3.toSha(amount, 'mc'),
            to: tgtaddr,
            gas: "2000000",
            gasPrice: chain3.mc.gasPrice,
            data: strData
        });

    console.log('sending from:' + src + ' to:' + tgtaddr + ' amount:' + amount + ' with data:' + strData);
    waitBlockForTransaction(transHash);
}

function checkBalance(inaddr, inMcAmt) {
    if (chain3.mc.getBalance(inaddr) / 1e18 >= inMcAmt) {
        return true;
    } else {
        return false;
    }
}

function waitBalance(addr, target) {
    while (true) {
        let balance = chain3.mc.getBalance(addr) / 1000000000000000000;
        if (balance >= target) {
            console.log("account has enough balance " + balance);
            break;
        }
        console.log("Waiting the account has enough balance " + balance);
        sleep(5000);
    }
}

// wait certain blocks for the contract to be mined
function waitForBlocks(innum) {
    let startBlk = chain3.mc.blockNumber;
    let preBlk = startBlk;
    console.log("Waiting for blocks to confirm the contract... currently in block " + startBlk);
    while (true) {
        let curblk = chain3.mc.blockNumber;
        if (curblk > startBlk + innum) {
            console.log("Waited for " + innum + " blocks!");
            break;
        }
        if (curblk > preBlk) {
            console.log("Waiting for blocks to confirm the contract... currently in block " + curblk);
            preBlk = curblk;
        } else {
            console.log("...");
        }

        sleep(8000);
    }
}

function waitBlockForContract(transactionHash) {
    console.log("Waiting a mined block to include your contract...");

    while (true) {
        let receipt = chain3.mc.getTransactionReceipt(transactionHash);
        if (receipt && receipt.contractAddress) {
            console.log("contract has been deployed at " + receipt.contractAddress);
            break;
        }
        console.log("block " + chain3.mc.blockNumber + "...");
        sleep(50000);
    }
    return chain3.mc.getTransactionReceipt(transactionHash).contractAddress;
}


function waitBlockForTransaction(transactionHash) {
    console.log("Waiting a mined block to include your contract...");

    while (true) {
        let receipt = chain3.mc.getTransactionReceipt(transactionHash);
        if (receipt && chain3.fromDecimal(receipt.status) == 1) {
            console.log("transaction successfully!");
            break;
        } else if (receipt && chain3.fromDecimal(receipt.status) == 0) {
            console.log("transaction failed!");
            break;
        }
        console.log("block " + chain3.mc.blockNumber + "...");
        sleep(50000);
    }
}

function unlockAccount(baseaddr, basepsd) {
    // Unlock the baseaddr for contract deployment
    if (chain3.personal.unlockAccount(baseaddr, basepsd, 0)) {
        console.log(`${baseaddr} is unlocked`);
    } else {
        console.log(`unlock failed, ${baseaddr}`);
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

    var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../contract.json"), 'utf8'));
    scsPool = subchainprotocolbaseContract.at(config.data[1]['scsPoolAddr']);
    console.log("scsPool created at address:", scsPool.address);
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

    // console.log("SubChainBase abi:", abi);
    var subchainbaseContract = chain3.mc.contract(JSON.parse(abi));
    var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../contract.json"), 'utf8'));
    microChain = subchainbaseContract.at(config.data[2]['microChainAddr']);
    console.log("microChain created at address:", microChain.address);
    return microChain;
}

function registerScsToPool(proto, num, scs) {
    if (num >= minScsDeposit) {
        for (var i = 0; i < scs.length; i++) {
            sendtx(baseaddr, proto, num, '0x4420e486000000000000000000000000' + scs[i].substr(2, 100));
        }
    } else {
        console.log("Cannot register SCSs with not enough deposit!", num);
    }

}

//Open the MicroChain register process
function registerOpen(subchainaddr) {
    console.log("registerOpen", subchainaddr);
    sendtx(baseaddr, subchainaddr, '0', '0x5defc56c');
}

//Close the MicroChain register process
function registerClose(subchainaddr) {
    console.log("registerClose", subchainaddr);
    sendtx(baseaddr, subchainaddr, '0', '0x69f3576f');
}

// must do before flush
function addMicroChainFund(inaddr, num) {
    console.log("addFund", inaddr);
    sendtx(baseaddr, inaddr, num, '0xa2f09dfa')
}

// vnoderegister(viaAddress, 1, "127.0.0.1:50062")
// vnodeprotocolbase.vnodeCount()
// vnode - vnode contract object with register function, and address
// num - deposit for VNODE to join the VNODE pool
// data - VNODE register FUNCTION
function vnoderegister(vnode, num, ip, via, rpcLink) {
    var data = vnode.register.getData(vnode.address, via, ip, rpcLink)
    console.log("Registering VNODE ......")
    sendtx(baseaddr, vnode.address, num, data)
}

module.exports = {
    sendtx,
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
    vnoderegister
}
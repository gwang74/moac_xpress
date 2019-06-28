const Chain3 = require('Chain3');
const fs = require('fs');
const utils = require('./utils');
const path = require('path');

//===============Setup the Parameters==========================================
// need to have a valid account to use for contracts deployment
const initConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../initConfig.json"), 'utf8'));
const baseaddr = initConfig["baseaddr"];
const basepsd = initConfig["basepsd"];

// The known SCS on MOAC network
var addScs = initConfig["addScs"];
if (addScs.length == 0) {
  console.log("Need addScs in initConfig .json!!!");
  return;
}

//===============Check the Blockchain connection===============================
// 
// Using local node or remote to send TX command
const vnodeUri = initConfig["vnodeUri"];

let chain3 = new Chain3();
chain3.setProvider(new chain3.providers.HttpProvider(vnodeUri));

if (!chain3.isConnected()) {
  throw new Error('unable to connect to moac vnode at ' + vnodeUri);
} else {
  console.log('connected to moac vnode at ' + vnodeUri);
  let balance = chain3.mc.getBalance(baseaddr);
  console.log('Check src account balance:' + baseaddr + ' has ' + chain3.fromSha(balance, 'mc'));
}

// Unlock the baseaddr for contract deployment
utils.unlockAccount(baseaddr, basepsd);

// Check to make sure all SCSs have enough balance than the min deposit required by 
// SCS pool
var minScsDeposit = initConfig["minScsDeposit"];
for (var i = 0; i < addScs.length; i++) {
  if (utils.checkBalance(addScs[i], minScsDeposit)) {
    console.log("SCS has enough balance, continue...")
  } else {
    // Add balance
    console.log("Add funding to SCS!");
    utils.sendtx(baseaddr, addScs[i], minScsDeposit);
    utils.waitBalance(addScs[i], minScsDeposit);
  }
}

var scspool = utils.deployscspoolWithAddr();
var scsCount = chain3.toDecimal(scspool.scsCount());
console.log('scspool.scsCount:', scsCount);
for (var i = 0; i < addScs.length; i++) {
  console.log("Registering SCS to the pool", scsPool.address);
  let data = scspool.register.getData(addScs[i]);
  utils.sendtx(baseaddr, scspool.address, minScsDeposit, data);
}

while (true) {
  let count = chain3.toDecimal(scsPool.scsCount());
  let toCount = Number(scsCount) + Number(addScs.length);
  if (count >= toCount) {
    console.log("registertopool has enough scs " + count);
    break;
  }
  console.log("Waiting registertopool, current scs count=" + count);
  utils.sleep(5000);
}

var subchainbase = utils.deployMicroChainWithAddr();
for (var i = 0; i < addScs.length; i++) {
  scsCount = chain3.toDecimal(scspool.scsCount());
  console.log('scspool.scsCount:', scsCount);
  data = subchainbase.registerAdd.getData(scsCount);
  utils.sendtx(baseaddr, subchainbase.address, 0, data);
  var nodeCount = chain3.toDecimal(subchainbase.nodeCount());
  console.log('subchainbase.nodeCount():', nodeCount);
}
console.log("waiting for a flush!!!");

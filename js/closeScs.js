const Chain3 = require('Chain3');
const fs = require('fs');
const utils = require('./utils');
const path = require('path');

//===============Setup the Parameters==========================================
// need to have a valid account to use for contracts deployment
const initConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../initConfig.json"), 'utf8'));
const baseaddr = initConfig["baseaddr"];
const basepsd = initConfig["basepsd"];

// The known Monitor SCS on MOAC network
const monitorAddr = initConfig["monitorAddr"];
const monitorLink = initConfig["monitorLink"];
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
// utils.unlockAccount(baseaddr, basepsd); 
var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../contract.json"), 'utf8'));
utils.sendtx(baseaddr, config.data[2]['microChainAddr'], 0, '0x43d726d6');
console.log("waiting for a flush!!!");


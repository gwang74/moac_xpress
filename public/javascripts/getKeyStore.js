
var Wallet = require('ethereumjs-wallet');
var privateKey = '86736091a441dffeb8656e731474433aaf531c4adab0497fa38d36215f44f18d'; // 不带"0x"
var key = Buffer.from(privateKey, 'hex');
var wallet = Wallet.fromPrivateKey(key);
var keystorePassword = '123456'    
var keyStore = wallet.toV3String(keystorePassword);
console.log("Get keystore:", keyStore);

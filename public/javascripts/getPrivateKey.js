
var keythereum = require("keythereum");
// var datadir = "C:\\Users\\lyq2018\\AppData\\Roaming\\MoacNode";  //moacnode目录，根据实际修改
var datadir = "/Users/wanggang/Library/MoacNode";                    //苹果mac系统moacnode目录，根据实际修改
var address = "0x7a2dc129b3d794e4e8a009c83ffd7a2412f5e326";       //本地节点账号，根据实际修改
const password = "123456";                                     //账号密码，根据实际修改

var keyObject = keythereum.importFromFile(address, datadir);
var privateKey = keythereum.recover(password, keyObject);        //输出私钥
console.log("0x" + privateKey.toString('hex'));
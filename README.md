# moac_xpress

在MOACCHAIN提供的[脚本](https://github.com/MOACChain/moac-core)基础上，完成的墨客子一键链搭建脚本。

本脚本可完成的功能：
1. 子链部署出块
2. 子链添加新的节点
3. 子链添加监听节点
4. 子链关闭

---

## 安装
```javascript
npm install
```

## 启动前准备
### Vnode节点同步
版本来源: [https://github.com/MOACChain/moac-core/releases/](https://github.com/MOACChain/moac-core/releases/)

需先配置vnodeconfig.json，配置后可在测试环境testnet启动节点：

```javascript
./moac -testnet -rpc -rpcaddr ‘your ip’ -rpcport 8545 -rpcapi “chain3,mc,net,db,personal,admin,miner,txpool”
```

若是节点仅本地使用，`-rpcaddr`和`-rpcport`可无需添加。

成功启动后，同步需要一段时间。

具体可参照：

[墨客区块链(MOAC BlockChain) 节点安装教程](https://blog.csdn.net/lyq13573221675/article/details/81078424)

### SCS节点启动，获取SCS帐号
需先配置userconfig.json后，配置好后可启动子链

```javascript
./scsserver –password “123456” 
```

如果直接运行scsserver，则默认密码为 moacscsofflineaccountpwd

具体可参照：

[墨客区块链(MOAC BlockChain)子链搭建教程](https://blog.csdn.net/lyq13573221675/article/details/81125954)


[部署子链前的准备工作](https://moacdocs-chn.readthedocs.io/zh_CN/latest/subchain/%E9%83%A8%E7%BD%B2%E5%AD%90%E9%93%BE%E5%89%8D%E7%9A%84%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C.html)

### 配置


  

## 启动服务
```javascript
npm run start
```
·启动前，需先配置工程根目录下的文件`initConfig.json`中的参数`vnodeUri`，否则服务无法启动。如果没有，可以按照启动前准备，自行配置vnode节点。
```json
{
	...

	"vnodeUri": "http://localhost:8545",  // 用户提供可连接的vnode节点
	
	...
}
```
成功启动后弹出用户操作界面，只需填写相应地址，点击按钮即可完成子链部署。

#### 子链相关合约地址contract.json
部署成功后会生成该合约地址文件
```json
{
	"data": [
		{
			"vnodePoolAddr": "0x..."  // Vnode矿池合约地址
		},
		{
			"scsPoolAddr": "0x..."  // 子链矿池地址
		},
		{
			"microChainAddr": "0x..."  // 子链合约地址
		}
	]
}
```

具体可查看
[墨客链中文文档](https://moacdocs-chn.readthedocs.io/zh_CN/latest/index.html)
[子链搭建教程](https://blog.csdn.net/lyq13573221675/article/details/81125954)

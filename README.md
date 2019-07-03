# moac_xpress

在MOACCHAIN提供的[脚本](https://github.com/MOACChain/moac-core)基础上，完成的墨客子一键链搭建脚本。

本脚本可完成的功能：
1. 子链部署出块
2. 子链添加新的节点
3. 子链添加监听节点
4. 子链关闭

---

### 安装
```javascript
npm install
```
### 配置initConfig.json
```json
{
	"baseaddr": "0x...",  // 子链操作账号：进行创建合约，发起交易等基本操作
	"basepsd": "123456",  // 操作账号对应keystone密码
	// scs节点
	"scs": [
		"0x...",
		"0x...",
		"0x..."
	],
	"vnodeVia": "0x...",  // 主链vnode收益账号
	"vnodeUri": "http://localhost:8545",  // 代理Vnode节点
	"vnodeConnectUrl": "127.0.0.1:50062",  // vnode提供给子链的调用地址
	"minScsRequired": 3, // 子链需要SCS的最小数量，当前需要从如下值中选择：1，3，5，7
	"rpcLink": "",
	"minVnodeDeposit": 1,  // 代理Vnode节点的保证金 
	"minScsDeposit": 1,  // 子链矿池的保证金
	"microChainDeposit": 1,  // 子链合约的gas费
	// 需要添加的子链节点
	"addScs": [
		"0x...",
		"0x..."
	],
	"monitorAddr": "0x...",  // 用于监听的子链
	"monitorLink": "127.0.0.1:8546" // 监听子链的rpc接口
}
```

### 脚本使用
#### 子链部署出块
```javascript
npm run start
```

#### 子链添加节点
```javascript
npm run addScs
```
#### 子链添加监听节点
```javascript
npm run addMonitorScs
```
#### 子链关闭
```javascript
npm run close
```
#### 子链相关合约地址contract.json
上述命令执行后会生成该文件
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

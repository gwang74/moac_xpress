<template>
  <div class="home">
    <el-alert
      class="deployInfo"
      :title="alertMsg"
      center
      :closable="false"
      :type="alertType"
      v-show="isshow">
    </el-alert>
    <section class="head_back"></section>
    <section class="head">
      <div class="topImgBox">
        <img src="../images/logo.png" style="height: 150px;display: flex;" />
      </div>
      <div class="topTitleBox">
        <span>墨客应用链一键发链工具</span>
      </div>
    </section>
    <section class="content">
      <el-tabs tab-position="top">
        <el-tab-pane label="准备工作说明">
          <div class="content-pane">
            <div class="content-pane-left" style="text-align:left;width:800px">
            <p><b>1.Vnode节点同步</b><br>
            版本来源: <a style="text-decoration: none;color: #419efb;" href="https://github.com/MOACChain/moac-core/releases/">https://github.com/MOACChain/moac-core/releases/</a><br>
            配置好vnodeconfig.json后，可在测试环境testnet启动节点：<br>
            ./moac -testnet -rpcaddr ‘your ip’ -rpcport ‘8545’ -rpc -rpcapi “chain3,mc,net,db,personal,admin,miner,txpool”<br>
            同步需要一段时间<br>  
            具体可参照：<br>
            <el-link type="primary" href="https://blog.csdn.net/lyq13573221675/article/details/81078424">墨客区块链(MOAC BlockChain) 节点安装教程</el-link><br>
            <br>
            <b>2.SCS节点启动，获取SCS帐号</b><br>
            配置好userconfig.json后，可启动<br>
            ./scsserver –password “123456”<br>  
            具体可参照：<br>
            <el-link type="primary" href="https://blog.csdn.net/lyq13573221675/article/details/81125954">墨客区块链(MOAC BlockChain) 应用链搭建教程</el-link><br>
            </p>
            <p style="margin-top: 40px;"><b>详情参考：</b><br>
            <el-link type="primary" href="https://moacdocs-chn.readthedocs.io/zh_CN/latest/subchain/%E9%83%A8%E7%BD%B2%E5%AD%90%E9%93%BE%E5%89%8D%E7%9A%84%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C.html">
            部署应用链前的准备工作
            </el-link>
            </p>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="部署应用链出块">
          <div class="content-pane">
            <div class="content-pane-left" style="margin-top: 20px;">
              <el-form
                label-position="left"
                label-width="160px"
                :model="configData"
                ref="configData"
                :rules="rules">
                <el-form-item label="应用链操作账号" prop="baseaddr">
                  <el-input v-model="configData.baseaddr" type="text" placeholder="请输入应用链操作账号"></el-input>
                </el-form-item>
                <el-form-item label="密钥" prop="privatekey">
                  <el-input v-model="configData.privatekey" type="password" placeholder="请输入密钥"></el-input>
                </el-form-item>
                <el-form-item label="所需最小应用链数" prop="minScsRequired">
                  <el-input
                    v-model="configData.minScsRequired"
                    type="number"
                    maxlength="1"
                    @change="getScsNumber"
                    placeholder="请输入最小应用链数，当前允许值：1，3，5，7"
                  ></el-input>
                </el-form-item>
                <el-form-item label="SCS节点" prop="scs">
                  <li
                    v-for="(item,index) of  configData.scs"
                    :key="'scs'+index"
                    style="list-style:none"
                  >
                    <el-input
                      v-model="configData.scs[index]"
                      type="text"
                      style="margin-bottom: 10px;"
                      placeholder="请输入节点地址"
                    ></el-input>
                  </li>
                </el-form-item>
                <el-form-item label="主链vnode收益账号" prop="vnodeVia">
                  <el-input v-model="configData.vnodeVia" type="text" placeholder="请输入主链vnode收益账号"></el-input>
                </el-form-item>
                <el-form-item label="代理vnode节点" prop="vnodeUri">
                  <el-input v-model="configData.vnodeUri" type="text" placeholder="请输入代理vnode节点"></el-input>
                </el-form-item>
                <el-form-item label="应用链调用地址" prop="vnodeConnectUrl">
                  <el-input v-model="configData.vnodeConnectUrl" type="text" placeholder="请输入应用链调用地址"></el-input>
                </el-form-item>
                <el-form-item label="代理vnode节点保证金" prop="minVnodeDeposit">
                  <el-input v-model="configData.minVnodeDeposit" type="number" placeholder="请输入代理vnode节点保证金"></el-input>
                </el-form-item>
                <el-form-item label="应用链矿池保证金" prop="minScsDeposit">
                  <el-input v-model="configData.minScsDeposit" type="number" placeholder="请输入应用链矿池保证金"></el-input>
                </el-form-item>
                <el-form-item label="应用链合约gas费" prop="microChainDeposit">
                  <el-input v-model="configData.microChainDeposit" type="number" placeholder="请输入应用链合约gas费"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    @click="deployAction"
                    class="button"
                    style="margin-left: -160px;"
                    :disabled="deployButton"
                  >一键部署</el-button>
                  <el-button @click="clear" class="button">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
            <div class="infoboard">
              <el-form
              :model="contractData"
              ref="contractData">
                <span>完成部署后应用链合约相关地址</span>
                <el-form-item label="Vnode矿池合约地址">
                  <el-input v-model="contractData[0].vnodePoolAddr" type="text" readonly></el-input>
                </el-form-item>
                <el-form-item label="应用链矿池地址">
                  <el-input v-model="contractData[1].scsPoolAddr" type="text" readonly></el-input>
                </el-form-item>
                <el-form-item label="应用链合约地址">
                  <el-input v-model="contractData[2].microChainAddr" type="text" readonly></el-input>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="添加新的Scs节点">
          <div class="content-pane">
            <div class="content-pane-left">
              <div id="list">
                <div class="contentList">
                  <div style="float:left;margin:10px;width: 100%;text-align: left;">添加的Scs节点：</div>
                  <li
                    v-for="(item,index) of  addNewScs"
                    :key="'new'+ index"
                    style="list-style:none"
                  >
                    <div style="padding:10px;">
                      <el-input v-model="addNewScs[index]" placeholder="请输入Scs节点地址"></el-input>
                    </div>
                  </li>
                  <div style="float:left;width:100%">
                    <el-button style="float: left;margin: 10px;" @click="addScs">+</el-button>
                    <el-button style="float: left;margin: 10px;" @click="cancelScs">-</el-button>
                  </div>
                </div>
              </div>
              <el-button type="primary" @click="addScsToConfig" class="button" :disabled="deployButton">一键添加</el-button>
            </div>
            <div class="infoboard">
                <span>已完成添加的Scs节点</span>
                <div class="infoboard-list">
                  <li
                      v-for="(item,index) of addedScs"
                      :key="'new'+ index"
                      style="list-style:none"
                    >
                      <div style="padding:10px;">
                        <el-input v-model="addedScs[index]" readonly></el-input>
                      </div>
                    </li>
                </div>  
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="添加监听应用链节点">
          <div class="content-pane">
            <div class="content-pane-left"  style="margin-top: 20px;">
              <el-form
                label-position="left"
                label-width="150px"
                :model="monitor"
                ref="monitor"
                :rules="monitorRules">
                <el-form-item label="监听应用链账号" prop="monitorAddr">
                  <el-input v-model="monitor.monitorAddr" type="text" placeholder="请输入监听应用链账号"></el-input>
                </el-form-item>
                <el-form-item label="监听应用链rpc接口" prop="monitorLink">
                  <el-input v-model="monitor.monitorLink" type="text" placeholder="请输入监听应用链rpc接口"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    @click="addMonitorAddrtoConfig"
                    class="button"
                    style="margin-left: -150px;"
                    :disabled="deployButton">一键添加</el-button>
                  <el-button @click="clearMoitor" class="button">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="关闭应用链">
          <div class="content-pane">
            <el-button type="primary" @click="onClose" class="button" :disabled="deployButton">一键关闭</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
</template>

<script>
import { truncate, constants } from 'fs';
import { setTimeout } from 'timers';
export default {
  name: "home",
  data() {
    var validateScs = (rule, value, callback) => {
      if (value.includes("")) {
        callback(new Error("请填写所有所需应用链"));
      } else {
        callback();
      }
    };
    var validateNumber = (rule, value, callback) => {
      if (value <= 0) {
        callback(new Error("不可小于零"));
      } else {
        callback();
      }
    };
    var validateDeposit = (rule, value, callback) => {
      if (value <= 0) {
        callback(new Error("不可小于1"));
      } else {
        callback();
      }
    }
    var validateMin = (rule, value, callback) => {
      let arr = [1, 3, 5, 7];
      if (!arr.includes(Number(value))) {
        callback(new Error("当前需要从如下值中选择：1，3，5，7"));
      } else {
        callback();
      }
    };
    return {
      initConfig: {
        baseaddr: "", // 子链操作账号：进行创建合约，发起交易等基本操作
        privatekey: "", //密钥
        scs: [], // scs节点
        vnodeVia: "", // 主链vnode收益账号
        vnodeUri: "", // 代理Vnode节点
        vnodeConnectUrl: "", // vnode提供给子链的调用地址
        minScsRequired: 3, // 子链需要SCS的最小数量，当前需要从如下值中选择：1，3，5，7
        rpcLink: "",
        minVnodeDeposit: 1, // 代理Vnode节点的保证金
        minScsDeposit: 1, // 子链矿池的保证金
        microChainDeposit: 1, // 子链合约的gas费
        addScs: [], // 需要添加的子链节点
        monitorAddr: "", // 用于监听的子链
        monitorLink: "" // 监听子链的rpc接口
      },
      configData: {
        baseaddr: "", // 子链操作账号：进行创建合约，发起交易等基本操作
        privatekey: "", //密钥
        scs: [""], // scs节点
        vnodeVia: "", // 主链vnode收益账号
        vnodeUri: "", // 代理Vnode节点
        vnodeConnectUrl: "", // vnode提供给子链的调用地址
        minScsRequired: "", // 子链需要SCS的最小数量，当前需要从如下值中选择：1，3，5，7
        rpcLink: "",
        minVnodeDeposit: "", // 代理Vnode节点的保证金
        minScsDeposit: "", // 子链矿池的保证金
        microChainDeposit: "", // 子链合约的gas费
        addScs: [], // 需要添加的子链节点
        monitorAddr: "", // 用于监听的子链
        monitorLink: "" // 监听子链的rpc接口
      },
      monitor: {
        monitorAddr: "", // 用于监听的子链
        monitorLink: "" // 监听子链的rpc接口
      },
      addNewScs: [],//需要添加的子链
      addedScs:[],//已完成添加的子链
      rules: {
        baseaddr: [{ required: true, message: "不可为空", trigger: "blur" }],
        privatekey: [{ required: true, message: "不可为空", trigger: "blur" }],
        scs: [
          { required: true, message: "不可为空", trigger: "blur" },
          { validator: validateScs, trigger: "blur" }
        ],
        vnodeVia: [{ required: true, message: "不可为空", trigger: "blur" }],
        vnodeUri: [{ required: true, message: "不可为空", trigger: "blur" }],
        vnodeConnectUrl: [
          { required: true, message: "不可为空", trigger: "blur" }
        ],
        minScsRequired: [
          { required: true, message: "不可为空", trigger: "blur" },
          { validator: validateMin, trigger: "blur" }
        ],
        minVnodeDeposit: [
          { required: true, message: "不可为空", trigger: "blur" },
          { validator: validateDeposit, trigger: "blur" }
        ],
        minScsDeposit: [
          { required: true, message: "不可为空", trigger: "blur" },
          { validator: validateDeposit, trigger: "blur" }
        ],
        microChainDeposit: [
          { required: true, message: "不可为空", trigger: "blur" },
          { validator: validateDeposit, trigger: "blur" }
        ]
      },
      monitorRules: {
        monitorAddr: [{ required: true, message: "不可为空", trigger: "blur" }],
        monitorLink: [{ required: true, message: "不可为空", trigger: "blur" }]
      },
      url: "http://localhost:3000/scss",
      contractData :[
        {
          vnodePoolAddr: ""  // Vnode矿池合约地址
        },
        {
          scsPoolAddr: ""  // 子链矿池地址
        },
        {
          microChainAddr: ""  // 子链合约地址
        }
      ],
      deployButton:false,
      isshow:false,
      alertMsg:"开始部署，此过程需要一段时间，请耐心等待...",
      alertType:"info"
    };
  },
  created() {
    this.getInitConfig();
    this.getContact();
  },
  methods: {
    getInitConfig() {
      this.$http.get(this.url + "/getInitConfig").then(
        function(res) {
          console.log(res.body);
          this.configData = res.body;
          if(this.configData.scs.length === 0){
            this.configData.scs = [""];
          }
          this.addedScs = res.body.addScs;
          this.monitor.monitorAddr = res.body.monitorAddr;
          this.monitor.monitorLink = res.body.monitorLink;
        },
        function() {
          console.log("请求失败处理");
        }
      );
    },
    getScsNumber() {
      var length = this.configData.scs.length;
      var number = Number(this.configData.minScsRequired);
      if (number > 0) {
        while (
          this.configData.scs.length !== Number(this.configData.minScsRequired)
        ) {
          if (
            this.configData.scs.length > Number(this.configData.minScsRequired)
          ) {
            this.configData.scs.splice(-1);
          } else if (
            this.configData.scs.length < Number(this.configData.minScsRequired)
          ) {
            this.configData.scs.push("");
          }
        }
      }
    },
    deployAction() {
      this.$refs["configData"].validate( valid => {
        if (valid) {
          console.log(this.contractData)
          if(this.contractData[0].vnodePoolAddr != "" &&
          this.contractData[1].scsPoolAddr != "" &&
          this.contractData[2].microChainAddr != ""){
            this.$confirm('当前部署已完成，继续重新部署会覆盖当前已生成的相关合约地址, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
                this.deployStart();
            }).catch(() => {         
            });
          }else{
            this.deployStart();
          }
        }
      });
    },
    deployStart() {
      this.addData();
      this.$http.post(this.url + "/initConfig", this.initConfig, {emulateJSON: false}).then(
        function(res) {
          console.log(res);
          if (res.status === 200) {
            //this.$message({type: "info",message: "开始部署，请耐心等待！"});
            this.setAlert(true, "info", "开始部署，此过程需要一段时间，请耐心等待...");
            this.deployButton = true;
            this.$http.post(this.url + "/deploy").then(
              function(res) {
                console.log(res);
                var data = JSON.parse(res.bodyText);
                if(data){
                  switch(data.status){
                    case "success":
                      this.setAlert(true,"success", data.msg);
                      this.getContact();
                      this.deployButton = false;
                      break;
                    case "error":
                      this.setAlert(true,"error", data.msg);
                      this.deployButton = false;
                      break;
                  }
                }
              },
              function(res) {
                console.log(res.status);
                this.setAlert(true,"error", "部署失败！");
                this.deployButton = false;
              }
            );
          }
        },
        function(res) {
          console.log(res.status);
          this.setAlert(true,"error", "初始化配置失败！");
          return false;
        }
      );
    },
    addData(){
        this.initConfig.baseaddr = this.configData.baseaddr;
        this.initConfig.privatekey = this.configData.privatekey;
        this.initConfig.scs = this.configData.scs;
        this.initConfig.vnodeVia = this.configData.vnodeVia;
        this.initConfig.vnodeUri = this.configData.vnodeUri;
        this.initConfig.vnodeConnectUrl = this.configData.vnodeConnectUrl;
        this.initConfig.minScsRequired = this.configData.minScsRequired;
        this.initConfig.minVnodeDeposit = this.configData.minVnodeDeposit;
        this.initConfig.minScsDeposit = this.configData.minScsDeposit;
        this.initConfig.minScsDeposit = this.configData.minScsDeposit;
    },
    addScs() {
      this.addNewScs.push("");
    },
    cancelScs() {
      this.addNewScs.splice(-1);
    },
    setAlert(show, type, msg){
      this.isshow = show;
      this.alertType = type;
      this.alertMsg = msg;
    },
    addScsToConfig() {
      this.addData();
      this.initConfig.addScs = this.addNewScs;
      this.$http.post(this.url + "/initConfig", this.initConfig, { emulateJSON: false }).then(
          function(res) {
            console.log(res);
            if (res.status === 200) {
              this.setAlert(true,"info", "开始添加应用链，请稍等!");
              this.deployButton = true;
              this.$http.post(this.url + "/addScs").then(
                function(res) {
                  console.log(res);
                  let data = JSON.parse(res.bodyText);
                  if(data){
                    switch(data.status){
                      case "success":
                        this.setAlert(true,"success", data.msg);
                        this.addedScs = this.addedScs.concat(this.addNewScs);
                        this.addNewScs = [];
                        this.deployButton = false;
                        break;
                      case "error":
                        this.setAlert(true,"error", data.msg);
                        this.deployButton = false; 
                        break;
                    }
                  }
                },
                function(res) {
                  console.log(res.status);
                  this.setAlert(true,"error", "添加应用链失败!");
                  this.deployButton = false;
                }
              );
            }
          },
          function(res) {
            console.log(res.status);
            this.setAlert(true,"error", "初始化配置失败！");
          }
        );
    },
    addMonitorAddrtoConfig() {
      this.$refs["monitor"].validate(valid => {
        if (valid) {
          this.addData();
          this.initConfig.monitorAddr = this.monitor.monitorAddr;
          this.initConfig.monitorLink = this.monitor.monitorLink;
          this.$http.post(this.url + "/initConfig", this.initConfig, {emulateJSON: false}).then(
              function(res) {
                console.log(res);
                if (res.status === 200) {
                  this.setAlert(true,"info", "开始添加监听应用链，请稍等！");
                  this.deployButton = true;
                  this.$http.post(this.url + "/addMonitor").then(
                    function(res) {
                      console.log(res);
                      let data = JSON.parse(res.bodyText);
                      if(data){
                        switch(data.status){
                          case "success":
                            this.setAlert(true,"success", data.msg);
                            this.deployButton = false;
                            break;
                          case "error":
                            this.setAlert(true,"error", data.msg); 
                            this.deployButton = false;
                            break;
                        }
                      }
                    },
                    function(res) {
                      console.log(res.status);
                      this.setAlert(true,"error", "添加监听应用链失败!");
                      this.deployButton = false;
                    }
                  );
                }
              },
              function(res) {
                console.log(res.status);
                this.setAlert(true,"error", "初始化配置失败!");
              }
            );
        }
      });
    },
    getContact() {
      this.$http.get(this.url + "/getContract").then(
        function(res) {
          console.log(res.body);
          if(res.body.data.length === 3){
            this.contractData = res.body.data;
          }else {
            this.contractData = [
              {vnodePoolAddr: ""},
              {scsPoolAddr: ""},
              {microChainAddr: ""}
            ];
          }
        },
        function() {
          console.log("请求失败处理");
          this.setAlert(true,"error", "获取应用链相关合约地址失败!");
        }
      );
    },
    onClose() {
      this.setAlert(true,"info", "正在关闭应用链，请稍等...");
      this.deployButton = true;
      this.$http.post(this.url + "/closeMicroChain", this.initConfig, {emulateJSON: true}).then(
          function(res) {
            console.log(res);
            if (res.status === 200) {
              this.setAlert(true,"success", "关闭成功!");
              this.deployButton = false;
              this.getContact();
            }
          },
          function(res) {
            console.log(res.status);
            this.setAlert(true,"error", "关闭应用链失败!");
            this.deployButton = false;
          }
        );
    },
    clear() {
      this.$refs["configData"].resetFields();
    },
    clearMoitor() {
      this.$refs["monitor"].resetFields();
    }
  }
};
</script>

<style lang="scss" scoped>
.home {
  display: block;
  height: 100%;
  width: 100%;
  min-width: 1250px;
}
.head_back {
  width: 100%;
  height: 170px;
  background: linear-gradient(180deg, #1384c5, #ffffff);
}
.head {
  position: absolute;
  top: 0px;
  width: 100%;
  height: 180px;
  .topTitleBox {
    float: right;
    width: 400px;
    margin-right: 200px;
    font-size: 30px;
    top: 65px;
    left: 400px;
    position: absolute;
    color: #ffffff;
  }
  .topImgBox {
    margin-left: 60px;
  }
}
.content {
  margin: 20px;
}
.deployInfo {
  position: absolute;
  top: 230px;
  width: 800px;
  right: 0px;
  left: 0px;
  height: 30px;
  margin: 0px auto;
  text-align: center;
  font-weight: bold;
}
.content-pane {
  margin: 20px;
  .content-pane-left {
    width: 600px;
    float: left;
    min-height:500px;
  }
  .infoboard {
    width: 500px;
    position: absolute;
    top: 40px;
    left: 700px;
    padding: 10px;
    background: #d4ebf6;
    height: 350px;
    .infoboard-list {
      overflow:auto;
      height: 320px;
    }
  }
}
.inputarea {
  width: 500px;
}
.step {
  margin-top: 20px;
}
.button {
  width: 200px;
  float: left;
  margin: 10px;
}
.popoverButton {
  border: none;
  color: #ffffff;
  position: absolute;
  top: 10px;
  right: 20px;
  background: none;
  font-size: 20px;
  cursor: pointer;
}

</style>

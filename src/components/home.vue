<template>
  <div class="home">
    <section class="head_back"></section>
    <section class="head">
      <div class="topImgBox">
        <img src="../images/logo.png" style="height: 150px;display: flex;" />
      </div>
      <div class="topTitleBox">
        <span>墨客子链一键发链工具</span>
      </div>
    </section>
    <section class="content">
      <el-tabs tab-position="top">
        <el-tab-pane label="部署子链出块">
          <div class="content-pane">
            <div class="content-pane-left">
              <el-form
                label-position="left"
                label-width="160px"
                :model="configData"
                ref="configData"
                :rules="rules">
                <el-form-item label="子链操作账号" prop="baseaddr">
                  <el-input v-model="configData.baseaddr" type="text"></el-input>
                </el-form-item>
                <el-form-item label="账号对应密码" prop="basepsd">
                  <el-input v-model="configData.basepsd" type="text"></el-input>
                </el-form-item>
                <el-form-item label="密钥" prop="privatekey">
                  <el-input v-model="configData.privatekey" type="text"></el-input>
                </el-form-item>
                <el-form-item label="SCS节点" prop="scs">
                  <li v-for="(item,index) of  configData.scs" :key="'scs'+index" style="list-style:none">
                    <el-input v-model="configData.scs[index]" type="text" style="margin-bottom: 10px;"></el-input>
                </li>
                </el-form-item>
                <el-form-item label="主链vnode收益账号" prop="vnodeVia">
                  <el-input v-model="configData.vnodeVia" type="text"></el-input>
                </el-form-item>
                <el-form-item label="代理vnode节点" prop="vnodeUri">
                  <el-input v-model="configData.vnodeUri" type="text"></el-input>
                </el-form-item>
                <el-form-item label="子链调用地址" prop="vnodeConnectUrl">
                  <el-input v-model="configData.vnodeConnectUrl" type="text"></el-input>
                </el-form-item>
                <el-form-item label="所需最小子链数" prop="minScsRequired">
                  <el-input v-model="configData.minScsRequired" type="number" maxlength="1" @change="getScsNumber"></el-input>
                </el-form-item>
                <el-form-item label="代理vnode节点保证金" prop="minVnodeDeposit">
                  <el-input v-model="configData.minVnodeDeposit" type="text"></el-input>
                </el-form-item>
                <el-form-item label="子链矿池保证金" prop="minScsDeposit">
                  <el-input v-model="configData.minScsDeposit" type="text"></el-input>
                </el-form-item>
                <el-form-item label="子链合约gas费" prop="microChainDeposit">
                  <el-input v-model="configData.microChainDeposit" type="text"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    @click="deployStart"
                    class="button"
                    style="margin-left: -160px;">一键部署</el-button>
                    <el-button @click="clear" class="button">重置</el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="添加新的子链">
          <div class="content-pane">
            <div class="content-pane-left">
            <div id="list">
              <div class="contentList">
                <div style="float:left;margin:10px;width: 100%;text-align: left;">添加的子链：</div>
                <li v-for="(item,index) of  addNewScs" :key="'new'+ index" style="list-style:none">
                  <div style="padding:10px;">
                    <el-input v-model="addNewScs[index]"></el-input>
                  </div>
                </li>
                <div style="float:left;width:100%">
                  <el-button style="float: left;margin: 10px;" @click="addScs"> + </el-button>
                  <el-button style="float: left;margin: 10px;" @click="cancelScs"> - </el-button>
                </div>
              </div>
            </div>
            <el-button type="primary" @click="addScsToConfig" class="button" >一键添加</el-button>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="添加监听子链">
          <div class="content-pane">
            <div class="content-pane-left">
            <el-form
                label-position="left"
                label-width="150px"
                :model="monitor"
                ref="monitor"
                :rules="monitorRules">
                <el-form-item label="监听子链账号" prop="monitorAddr">
                  <el-input v-model="monitor.monitorAddr" type="text"></el-input>
                </el-form-item>
                <el-form-item label="监听子链rpc接口" prop="monitorLink">
                  <el-input v-model="monitor.monitorLink" type="text"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="addMonitorAddrtoConfig" class="button" style="margin-left: -150px;">一键添加</el-button>
                  <el-button @click="clearMoitor" class="button">重置</el-button>
                </el-form-item>
            </el-form>
          </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="关闭子链">
          <div class="content-pane">
            <el-button type="primary" @click="onClose" class="button">一键关闭</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
</template>

<script>
export default {
  name: "home",
  data() {
    var validateScs = (rule, value, callback) => {
        if (value.includes("")) {
        callback(new Error('请填写所有所需子链'));
        } else {
          callback();
        }
      };
      var validateNumber = (rule, value, callback) => {
        if (value <= 0) {
          callback(new Error('不可小于零'));
        } else {
          callback();
        }
      };
      var validateMin = (rule, value, callback) => {
        let arr = [1,3,5,7];
        console.log(value)
        if (!arr.includes(Number(value))) {
          callback(new Error('当前需要从如下值中选择：1，3，5，7'));
        } else {
          callback();
        }
      };
    return {
      initConfig: {
        baseaddr: "", // 子链操作账号：进行创建合约，发起交易等基本操作
        basepsd: "", // 操作账号对应keystone密码
        privatekey: "", //密钥
        scs: ["", "", ""], // scs节点
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
        basepsd: "", // 操作账号对应keystone密码
        privatekey: "",//密钥
        scs: [""], // scs节点
        vnodeVia: "", // 主链vnode收益账号
        vnodeUri: "", // 代理Vnode节点
        vnodeConnectUrl: "", // vnode提供给子链的调用地址
        minScsRequired: "", // 子链需要SCS的最小数量，当前需要从如下值中选择：1，3，5，7
        rpcLink: "",
        minVnodeDeposit: "", // 代理Vnode节点的保证金
        minScsDeposit: "", // 子链矿池的保证金
        microChainDeposit: "", // 子链合约的gas费
      },
      monitor: {
        monitorAddr: "", // 用于监听的子链
        monitorLink: "" // 监听子链的rpc接口
      },
      addNewScs:[],
      addMonitorAddr:"",
      data: [
        {vnodePoolAddr: "0x1dab23d2085f75f561e99bdedb9744706bdfb7c8"},
		    {scsPoolAddr: "0x8f799ffb99f4aea8df16f57eb2705f704776d143"},
		    {microChainAddr: "0x33a2fea3a129f68455a7600cab9a337045607c18"}
      ],
      rules:{
        baseaddr:[{required: true, message: '不可为空', trigger: 'blur' }],
        basepsd:[ {required: true, message: '不可为空', trigger: 'blur' }],
        privatekey : [ {required: true, message: '不可为空', trigger: 'blur' }],
        scs:[ {required: true, message: '不可为空', trigger: 'blur' },
        {validator: validateScs ,trigger: 'blur'} ],
        vnodeVia:[ {required: true, message: '不可为空', trigger: 'blur' }],
        vnodeUri:[ {required: true, message: '不可为空', trigger: 'blur' }],
        vnodeConnectUrl:[ {required: true, message: '不可为空', trigger: 'blur' }],
        minScsRequired:[ {required: true, message: '不可为空', trigger: 'blur' },
                        {validator: validateMin, trigger:'blur'}],
        minVnodeDeposit:[ {required: true, message: '不可为空', trigger: 'blur' },
                        {validator: validateNumber, trigger:'blur'}],
        minScsDeposit:[ {required: true, message: '不可为空', trigger: 'blur' },
                        {validator: validateNumber, trigger:'blur'}],
        microChainDeposit:[ {required: true, message: '不可为空', trigger: 'blur' },
                        {validator: validateNumber, trigger:'blur'}]
      },
      monitorRules: {
        monitorAddr: [{required: true, message: '不可为空', trigger: 'blur' }],
        monitorLink: [{required: true, message: '不可为空', trigger: 'blur' }]
      },
      url:"http://localhost:3000/scss"
    };
  },
  created() {
    this.getInitConfig();
  },
  methods: {
    getInitConfig(){
       this.$http.get(this.url+"/getInitConfig").then(function(res){
              console.log(res.body); 
              this.configData = res.body;   
          },function(){
              console.log('请求失败处理');
          });
    },
    getScsNumber(){
      var length = this.configData.scs.length;
      var number = Number(this.configData.minScsRequired);
      //console.log(length,number);
      if(number > 0){
        while(this.configData.scs.length !== Number(this.configData.minScsRequired)){
        if(this.configData.scs.length > Number(this.configData.minScsRequired)){
          this.configData.scs.splice(-1);
        }else if(this.configData.scs.length < Number(this.configData.minScsRequired)){
          this.configData.scs.push("");
        }
      }
      }
    },
    deployStart() {
      this.$refs['configData'].validate((valid) => {
        if (valid) {
            this.initConfig.baseaddr = this.configData.baseaddr;
            this.initConfig.basepsd = this.configData.basepsd;
            this.initConfig.scs = this.configData.scs;
            this.initConfig.vnodeVia = this.configData.vnodeVia;
            this.initConfig.vnodeUri = this.configData.vnodeUri;
            this.initConfig.vnodeConnectUrl = this.configData.vnodeConnectUrl;
            this.initConfig.minScsRequired = Number(this.configData.minScsRequired);
            this.initConfig.minVnodeDeposit = Number(this.configData.minVnodeDeposit);
            this.initConfig.minScsDeposit = Number(this.configData.minScsDeposit);
            this.initConfig.minScsDeposit = Number(this.configData.minScsDeposit);
            if(this.initConfigAction){
              console.log(this.initConfig);
              this.$http.post(this.url + "/deploy",this.initConfig,{emulateJSON:true}).then(
              function(res){
                console.log(res);
                this.$message({
                type: "info",
                message: "转账成功"
              })   
              },function(res){
                  console.log(res.status);
                  this.$message.error('部署失败');
              })
            }    
        }
      })
    },
    addScs() {
      this.addNewScs.push("");
    },
    cancelScs() {
      this.addNewScs.splice(-1);
    },
    addScsToConfig() {
      this.initConfig.addScs = this.addNewScs;
      console.log(this.initConfig);
      if(this.initConfigAction){
        this.$http.post(this.url + "/addScs",this.initConfig,{emulateJSON:true}).then(
            function(res){
              console.log(res);    
          },function(res){
              console.log(res.status);
          })
      }
    },
    addMonitorAddrtoConfig() {
      this.$refs['monitor'].validate((valid) => {
        if (valid) {
          this.initConfig.monitorAddr = this.monitor.monitorAddr;
          this.initConfig.monitorLink = this.monitor.monitorLink;
          console.log(this.initConfig);
          if(this.initConfigAction ){
            this.$http.post(this.url + "/addMonitor",this.initConfig,{emulateJSON:true}).then(
              function(res){
                console.log(res);    
            },function(res){
                console.log(res.status);
            })
          }
        }
      })    
    },
    initConfigAction() {
      this.$http.post(this.url + "/initConfig",this.initConfig, {emulateJSON:true}).then(
        function(res){
          if(res.status === 200 ){
            return true;
          }
        },function(res){
        console.log(res.status);
        return false;
      });
    },
    getContact() {
      this.$http.get(this.url+"/getContract").then(function(res){
              console.log(res.body);    
          },function(){
              console.log('请求失败处理');
          });
    },
    onClose() {
      this.$http.post(this.url + "/closeMicroChain",this.initConfig, {emulateJSON:true}).then(
            function(res){
              console.log(res)
              if(res.status === 200 ){
              }    
          },function(res){
              console.log(res.status);
              this.$message.error('关闭操作未成功');
          });
    },
    clear() {
      this.$refs['configData'].resetFields();
    },
    clearMoitor() {
      this.$refs['monitor'].resetFields();
    }
  }
};
</script>

<style lang="scss" scoped>
.home {
  display: block;
  height: 100%;
  width: 100%;
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
    width: 300px;
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
.content-pane {
  margin: 20px;
  .content-pane-left {
    width: 600px;
    float: left;
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
</style>

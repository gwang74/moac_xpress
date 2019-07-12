var express = require('express');
var router = express.Router();
var scs = require('../public/javascripts/scs');


router.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

router.post('/deploy', scs.deploy);
router.post('/addScs', scs.addScs);
router.post('/addMonitor', scs.addMonitor);
router.post('/closeMicroChain', scs.closeMicroChain);
router.post('/initConfig', scs.config);
router.get('/getContract', scs.getContract);
router.get('/getInitConfig', scs.getInitConfig);

module.exports = router;
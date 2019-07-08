var express = require('express');
var router = express.Router();
var scs = require('../public/javascripts/scs');

router.post('/deploy', scs.deploy);
router.post('/addScs', scs.addScs);
router.post('/addMonitor', scs.addMonitor);
router.post('/closeMicroChain', scs.closeMicroChain);
router.post('/initConfig', scs.config);
router.get('/getContract', scs.getContract);

module.exports = router;

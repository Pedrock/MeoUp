var express = require('express');
var router = express.Router();

router.use('/downloads', require('./api/downloads'));
router.use('/youtube', require('./api/youtube'));

module.exports = router;

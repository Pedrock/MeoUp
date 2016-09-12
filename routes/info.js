const sysInfo = rootRequire('helpers/sys-info');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store');
    res.end(JSON.stringify(sysInfo[req.params.id]()));
});

module.exports = router;

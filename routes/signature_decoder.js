const signature_decoder = rootRequire('helpers/signature_decoder');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store');

    signature_decoder(res,req.query.v,req.query.s, function(error, result)
    {
        if (error)
        {
            res.writeHead(422);
            res.end('failed');
        }
        else {
            res.writeHead(200);
            res.end(JSON.stringify(result));
        }
    });
});

module.exports = router;

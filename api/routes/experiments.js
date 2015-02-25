var express = require('express');
var router  = express.Router();

var experiments     = require('../models/experiments');

router.get('/', function(req, res) {
    
    var experiment = {};

    if (req.query.exp != null)
        experiment = {_id:ObjectId(exp)};
    else
        res.jsonp({error:"No experiment given."});

    experiments.find(experiment, function (error, results) {
        res.jsonp(results)
    });

});

module.exports = router;
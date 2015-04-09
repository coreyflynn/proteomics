var express = require('express');
var router  = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;

var experiments     = require('../models/experiments');

router.get('/', function(req, res) {

    var experiment = {};

    if (req.query.exp != null){
        obj = new ObjectId(req.query.exp);
        experiment = {_id:obj};
    }
    else
        res.jsonp({error:"No experiment given."});

    experiments.find(experiment, function (error, results) {
        res.jsonp(results)
    });

});

module.exports = router;
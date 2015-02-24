var express = require('express');
var router  = express.Router();
var async   = require('async');

var geneNames = require('../models/geneNames');

router.get('/', function(req, res) {

	var query = req.query.q;
	var limit = req.query.l;

	if (query == null) query = {}
	if (limit == null) limit = 20;

	geneNames.find(query,{"gene":1,"_id":0}).limit(limit).exec(function (error, queryResults) {
		if (error)
			console.log(error);
		else
			res.jsonp(queryResults);
	})

};

module.exports = router;
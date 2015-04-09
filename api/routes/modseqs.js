var express = require('express');
var router  = express.Router();
var async   = require('async');

var modifiedSequences = require('../models/modifiedSequences');

router.get('/', function(req, res) {

	var query = {};
	var limit = req.query.l;
	var distinct = req.query.d;

	if (req.query.q != null) {
		try { query = JSON.parse(req.query.q) }
		catch (e) { res.json({error:"Problem parsing query parameter", exception: e.toString()}); return; }
	}
	
	if (limit == null) limit = 20;

	if (distinct != null) {
		modifiedSequences.distinct(query,distinct).exec(function (error, queryResults) {
			if (error)
				console.log(error);
			else
				res.jsonp(queryResults);
		});
	}
	else {
		modifiedSequences.find(query,{"_id":0}).limit(limit).exec(function (error, queryResults) {
			if (error)
				console.log(error);
			else
				res.jsonp(queryResults);
		});
	}

});

module.exports = router;
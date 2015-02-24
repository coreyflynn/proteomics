var express = require('express');
var router  = express.Router();
var async   = require('async');

var geneNames = require('../models/geneNames');

router.get('/', function(req, res) {

	var query = {};
	var limit = req.query.l;

	if (req.query.q != null) {
		try { query = JSON.parse(req.query.q) }
		catch (e) { res.json({error:"Problem parsing query parameter", exception: e.toString()}); return; }
	}
	
	if (limit == null) limit = 20;

	geneNames.find(query,{"gene":1,"_id":0}).limit(limit).exec(function (error, queryResults) {
		if (error)
			console.log(error);
		else
			res.jsonp(queryResults);
	})

});

module.exports = router;
var express = require('express');
var router  = express.Router();
var async   = require('async');

var geneNames        = require('../models/geneNames');

router.get('/', function(req, res) {

	var query = req.query.q;
	var limit = req.query.l;

	if(limit == null)
		limit = 20;

	if(query == null){
		geneNames.find().limit(limit).exec(function (error, queryResults) {
			if (error)
				console.log(error);
			else
				res.jsonp(queryResults);
		})
	}

}
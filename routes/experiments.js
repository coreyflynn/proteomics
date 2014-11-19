var express = require('express');
var router = express.Router();
var experiments = require('../models/experiments');
var proteingroups = require('../models/proteingroups');
var db = require('../models/database');

/* Blank page (help) */
router.get('/', function(req, res) {
	console.log(db.collections);
	var array = [];
	for (var i in db.collections){array.push(db.collections[i]);}
	res.render('search', {collections: array});
});

/* GET query page. */
router.get('/proteingroups', function(req, res) {

        var toFind = {};
        if (req.query.q != null) toFind = JSON.parse(req.query.q);
        proteingroups.find(toFind, function(err, results) {
                res.json(results);
        });
});

router.get('/experiments' , function(req, res) {

	var toFind = {};
	if (req.query.q != null) toFind = JSON.parse(req.query.q);
	experiments.find(toFind, function(err, results) {
		res.json(results);
	});
});

module.exports = router;

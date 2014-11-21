var express = require('express');
var router = express.Router();
var evidence = require('../models/evidence');
var experiments = require('../models/experiments');
var peptides = require('../models/peptides');
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

router.get('/experiments', function(req, res) {

	var toFind = {};
	if (req.query.q != null) toFind = JSON.parse(req.query.q);
	experiments.find(toFind, function(err, results) {
		res.json(results);
	});
});

router.get('/evidence', function(req, res) {

        var toFind = {};
        if (req.query.q != null) toFind = JSON.parse(req.query.q);
        evidence.find(toFind, function(err, results) {
                res.json(results);
        });
});


// #################################
// ### TODO: Other table lookups ###
// #################################

router.get('/bygenename', function(req, res) {

	var geneName = req.query.g;
	var criteria = {'gene names':geneName};
	var retFields = {expID:1, 'gene names':1, _id:0};
	if (geneName != null) {
        	// Query proteingroups
        	/*proteingroups.find(criteria, retFields, function(err, results) {
                	totalResults['proteinGroups'] = results;
        	});*/
        	proteingroups.count(criteria, function(err, proteinGroupsCount) {
			proteingroups.find(criteria, retFields, function(err, proteinGroupsResults) {
				evidence.count(criteria, function (err, evidenceCount) {
					evidence.find(criteria, retFields, function(err, evidenceResults) {
						res.json({counts:{proteinGroups: proteinGroupsCount, evidence: evidenceCount}, proteinGroups: proteinGroupsResults, evidence: evidenceResults});
					});
				});
			});
        	});
	};
}); 

module.exports = router;

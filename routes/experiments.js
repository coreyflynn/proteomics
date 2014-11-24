var express = require('express');
var router = express.Router();
var async = require('async');
var evidence = require('../models/evidence');
var experiments = require('../models/experiments');
var peptides = require('../models/peptides');
var proteingroups = require('../models/proteingroups');
var modspecpeptides = require('../models/modspecpeptides');
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

router.get('/bygene', function(req, res) {
        var geneName = req.query.g;
        var criteria = {'gene names':geneName};
        var retFields = {expID:1, 'gene names':1, _id:0};
        var results = {counts:{}};

        console.log("Bingo!");

        if (geneName != null) {
                async.parallel([
                        function (callback) {evidence.find(criteria, retFields, function(err, evidenceResults) {results.evidence = evidenceResults; callback();})},
                        function (callback) {evidence.count(criteria, function(err, evidenceCount) {results.counts.evidence = evidenceCount; callback();})},
                        function (callback) {proteingroups.find(criteria, retFields, function(err, proteinGroupsResults) {results.proteinGroups = proteinGroupsResults; callback();})},
                        function (callback) {proteingroups.count(criteria, function(err, proteinGroupsCount) {results.counts.proteinGroups = proteinGroupsCount; callback();})},
                        function (callback) {peptides.find(criteria, retFields, function(err, peptidesResults) {results.peptides = peptidesResults; callback();})},
                        function (callback) {peptides.count(criteria, function(err, peptidesCount) {results.counts.peptides = peptidesCount; callback();})},
                        function (callback) {modspecpeptides.find(criteria, retFields, function(err, modSpecPeptidesResults) {results.modSpecPeptides = modSpecPeptidesResults; callback();})},
                        function (callback) {modspecpeptides.count(criteria, function(err, modSpecPeptidesCount) {results.counts.modSpecPeptides = modSpecPeptidesCount; callback();})},
                        ],
                        function (err) {
                                if (err)
                                        console.log(err + " ### " + results);
                                res.json(results);
                        }
                );
        }
});

module.exports = router;

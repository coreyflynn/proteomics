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
        var geneName = req.query.g; var display = req.query.d;
        var criteria = {'gene names':geneName};
        var retFields = {expID:1, 'gene names':1, _id:0};
        var retFieldsDistinct = {expID:1, id:1, _id:0};
        var results = {counts:{}, distinct:{experiments:[]}};

        async.series([

		function (callback) {
			async.parallel([
                		function (callback) {
                		        evidence.find(criteria, retFields, function(err, evidenceResults) {
                	        	        results.evidence = evidenceResults; callback();
                		        })
                		},
                		function (callback) {
                		        evidence.count(criteria, function(err, evidenceCount) {
                		                results.counts.evidence = evidenceCount; callback();
                		        })
                		},
                		function (callback) {
                		        proteingroups.find(criteria, retFields, function(err, proteinGroupsResults) {
                		                results.proteinGroups = proteinGroupsResults; callback();
                		        })
                		},
                		function (callback) {
                		        proteingroups.count(criteria, function(err, proteinGroupsCount) {
                		                results.counts.proteinGroups = proteinGroupsCount; callback();
                		        })
                		},
                		function (callback) {
                		        peptides.find(criteria, retFields, function(err, peptidesResults) {
                		                results.peptides = peptidesResults; callback();
                		        })
                		},
                		function (callback) {
                		        peptides.count(criteria, function(err, peptidesCount) {
                		                results.counts.peptides = peptidesCount; callback();
                		        })
                		},
                		function (callback) {
                		        modspecpeptides.find(criteria, retFields, function(err, modSpecPeptidesResults) {
                		                results.modSpecPeptides = modSpecPeptidesResults; callback();
                		        })
                		},
                		function (callback) {
                		        modspecpeptides.count(criteria, function(err, modSpecPeptidesCount) {
                		                results.counts.modSpecPeptides = modSpecPeptidesCount; callback();
                		        })
                		},
                		function (callback) {
                		        evidence.find(criteria).distinct('expID', function(err, distinctEvidence) {
                		                results.distinct.evidence = distinctEvidence; callback();
                		        })
                		},
                		function (callback) {
                		        evidence.find(criteria).distinct('modified sequence', function (err, distinctModSeq) {
                		                results.distinct.modseq = distinctModSeq; callback();
                		        })
                		},
                		function (callback) {
                		        proteingroups.find(criteria).distinct('expID', function(err, distinctProteinGroups) {
                		                results.distinct.proteinGroups = distinctProteinGroups; callback();
                		        })
                		},
                		function (callback) {
                		        peptides.find(criteria).distinct('expID', function(err, distinctPeptides) {
                		                results.distinct.peptides = distinctPeptides; callback();
                		        })
                		},
                		function (callback) {
                		        modspecpeptides.find(criteria).distinct('expID', function(err, distinctModSpecPeptides) {
                		                results.distinct.modSpecPeptides = distinctModSpecPeptides; callback();
                		        })
                		}],
				function () {callback();})
		},

                function (callback) {
			var findCount = 0;
                        var distinctExperiments = results.distinct.evidence.concat(results.distinct.proteinGroups, results.distinct.peptides, results.distinct.modSpecPeptides);
                        for (var id in distinctExperiments) {
                                experiments.find({_id: distinctExperiments[id]}, {path:1}, function (err, fullDistinctInfo) {
                                        // Check to see if it's unique
					var counter; var add = true;
					for (counter = 0; counter < results.distinct.experiments.length; counter++) {
						console.log("Comparing " + fullDistinctInfo[0] + " and " + results.distinct.experiments[counter]);
						if (JSON.stringify(fullDistinctInfo[0]) == JSON.stringify(results.distinct.experiments[counter])) {
							console.log("They look so goddamn like the same person");
							add = false;
							break;
						}
					}
					if (add) results.distinct.experiments.push(fullDistinctInfo[0]);
					findCount++;
                                });
                        }

			// Check back every 500ms to see if we're done with the finds
			var int = setInterval(function () {
				if (findCount == distinctExperiments.length) {
					clearInterval(int);
					callback();
				}
			}, 500);
                }],

        function (err) {
                if (err) {
                        throw(err);
                }
                if (display == "table") {
                        console.log("Experiments array: " + JSON.stringify(results.distinct.experiments));
                        res.render('resultsTable', {results:JSON.stringify(results.distinct.experiments)});
                }
                else {
                        res.json(results);
                }
        });
});



module.exports = router;

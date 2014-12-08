var express = require('express');
var router = express.Router();
var async = require('async');
var evidence = require('../models/evidence');
var experiments = require('../models/experiments');
var peptides = require('../models/peptides');
var proteingroups = require('../models/proteingroups');
var modspecpeptides = require('../models/modspecpeptides');
var db = require('../models/database');


Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

/* Blank page (help) */
router.get('/', function(req, res) {
	var query = req.query.q;
	var retCols = req.query.r;
	var distinct = req.query.d;

	if (query    == null) query    = {'gene names':'ACTB'};
	if (retCols  == null) retCols  = {};

	if (distinct != null) results = [];
	else results = {};
	
	async.series([
		function (callback) {async.parallel([
			function (callback) {
				console.log("Starting e call");
				if (distinct == null) {
					evidence.find(query, retCols, function (error, queryResults) {
						results.evidence = queryResults; callback ();
					})
				}
				else {
					evidence.distinct(distinct, function (error, queryResults) {
						results = results.concat(queryResults); callback();
					})
				}
                                console.log("Ending e call");
			},
			function (callback) {
                                console.log("Starting m call");
	                        if (distinct == null) {
	                                modspecpeptides.find(query, retCols, function (error, queryResults) {
	                                        results.modSpecPeptides = queryResults; callback();
	                                })
	                        }
	                        else {
	                                modspecpeptides.distinct(distinct, function (error, queryResults) {
	                                        results = results.concat(queryResults); callback();
	                        	})
				}
                                console.log("Ending m call");
	                },
			function (callback) {
                                console.log("Starting p call");
	                        if (distinct == null) {
	                                peptides.find(query, retCols, function (error, queryResults) {
	                                        results.peptides = queryResults; callback();
	                                })
	                        }
	                        else {
	                                peptides.distinct(distinct, function (error, queryResults) {
	                                        results = results.concat(queryResults); callback();
	                        	})
				}
                                console.log("Ending p call");
	                },
			function (callback) {
                                console.log("Starting g call");
	                        if (distinct == null) {
	                                proteingroups.find(query, retCols, function (error, queryResults) {
	                                        results.proteinGroups = queryResults; callback();
	                                })
	                        }
	                        else {
	                                proteingroups.distinct(distinct, function (error, queryResults) {
	                                        results = results.concat(queryResults); callback();
	                        	})
				}
                                console.log("Ending g call");
	                }
		],
	
		function (error) {console.log("Calling back");callback();}
	
		)},
		
		// Sort the array (part two)
		function (callback) {
			if (distinct != null) {
				console.log("Uniquifying array...");
				results = results.unique();
			}
			callback();
		}
		],
		function (error) {
			res.json(results);
		});

});

router.get('/bygene', function(req, res) {
        var geneName = req.query.g; var display = req.query.display;
	var distinct = req.query.d;
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
						if (JSON.stringify(fullDistinctInfo[0]) == JSON.stringify(results.distinct.experiments[counter])) {
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
                        res.render('resultsTable', {results:JSON.stringify(results.distinct.experiments)});
                }
                else {
                        res.json(results);
                }
        });
});



module.exports = router;

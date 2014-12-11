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

router.get('/', function(req, res) {
        var query = req.query.q;
        var retCols = req.query.r;
        var distinct = req.query.d;

        if (query    == null) query    = {'gene names':'ACTB'};
        if (retCols  == null) retCols  = {'gene names':1, 'id':1};

        if (distinct != null) {
        	console.log("Distinct isn't null");
        	results = [];
        }
        else results = {};


        /* Two steps to be run in series:
        *    1. Make the calls to the database (in parallel)
        *    2. Make array unique
        *    Callback: Print JSON results */

        async.series([

        	// Step 1 - Make DB calls in parallel
        	function (outerCB) {
            	async.parallel([
                        function (callback) {
                                if (distinct == null) {
                                        evidence.find(query, retCols, function (error, queryResults) {
                                                results.evidence = queryResults;
                                                callback();
                                        });
                                }
                                else {
                                        evidence.distinct(distinct, function (error, queryResults) {
                                                results = results.concat(queryResults);
                                                callback();
                                        });
                                }
                        },
                ],

                // All DB calls made - proceed to step 2
                function (error) {
                	if(error)
                		console.log(error);
                	outerCB();
                })

            },

            // Step 2 - Make array unique
            function (outerCB) {
                    if (distinct != null) {
                            console.log("Uniquifying array...");
                            results = results.unique();
                    }
                    outerCB();
            }

		],

		// Callback - print JSON results
        function (error) {
        	if(error)
        		console.log(error);
            res.json(results);
        });

});

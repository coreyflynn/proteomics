var express = require('express');
var router  = express.Router();
var async   = require('async');

var evidence        = require('../models/evidence');
var peptides        = require('../models/peptides');
var proteingroups   = require('../models/proteingroups');
var modspecpeptides = require('../models/modspecpeptides');

var experiments     = require('../models/experiments');

Array.prototype.experiments = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(JSON.stringify(a[i]) == JSON.stringify(a[j])){
                a.splice(j--, 1);
	    }
        }
    }

    return a;
};

router.get('/', function(req, res) {

    var results   = [];
    var withPaths = [];
    var query     = {};
    var colsToAdd = [];
    
    if (req.query.q != null)
    	try {query     = JSON.parse(req.query.q);}
            catch (e) {res.json({error:"Problem parsing query parameter", exception: e.toString()});return;}

    if (req.query.col == null)
        colsToAdd = ["evidence","modificationSpecificPeptides","peptides","proteinGroups"];
    else
        try {colsToAdd = JSON.parse(req.query.col);}
        catch (e) {res.jsonp({error:"Problem parsing collections"});return;}

    /////////////////////////////////////////////////////
    /* Two steps to be run in series:
    *    1. Make the calls to the database (in parallel)
    *    2. Make array unique
    *    Callback: Print results */
    /////////////////////////////////////////////////////

    async.series([

    // Step 1 - Make DB calls in parallel
    /////////////////////////////////////
    function (outerCB) { async.parallel([

    // EVIDENCE //
        function (callback) {
            if (colsToAdd.indexOf('evidence') > -1) {
                evidence.distinct('expID', query, function (error, queryResults) {
                   results = results.concat(queryResults); callback();
                });
            }
            else {callback();}
        },

    // MODIFICATION SPECIFIC PEPTIDES //
        function (callback) {
            if (colsToAdd.indexOf('modificationSpecificPeptides') > -1) {
                modspecpeptides.distinct('expID', query, function (error, queryResults) {
                   results = results.concat(queryResults); callback();
                });
            }
            else {callback();}
        },

    // PEPTIDES //
        function (callback) {
            if (colsToAdd.indexOf('peptides') > -1) {
                peptides.distinct('expID', query, function (error, queryResults) {
                   results = results.concat(queryResults); callback();
                });
            }
            else {callback();}
        },

    // PROTEIN GROUPS //
        function (callback) {
            if (colsToAdd.indexOf('proteinGroups') > -1) {
                proteingroups.distinct('expID', query, function (error, queryResults) {
                   results = results.concat(queryResults); callback();
                });
            }
            else {callback();}
        }
        ],

    // All DB calls made - proceed to step 2
        function (error) {
            if(error)
                    console.log(error);
            outerCB();
        })

    },

    // Step 2 - Make array unique
    /////////////////////////////
        function (outerCB) {
            // Make array unique, then alphabetize.
            results = results.experiments();
            results.sort(function(a, b) {
                    if (JSON.stringify(a).toLowerCase() < JSON.stringify(b).toLowerCase()) return -1;
                    if (JSON.stringify(a).toLowerCase() > JSON.stringify(b).toLowerCase()) return 1;
                    return 0;
            });

            var space = results.indexOf("");
            if (space > -1) results.splice(space, 1);

            outerCB();
        },

    // Step 3 - Make path call
    //////////////////////////
    function (outerCB) {
	var counter;
	for (counter = 0; counter < results.length; counter++) {
	    experiments.find({_id:results[counter]}, {path:1}, function (error, queryResults) {
		withPaths.push(queryResults[0]);console.log("PUSHING SHIT");
	    });
	}
	var interval = setInterval(function() {
	    if (withPaths.length == results.length){
		clearInterval(interval);
		outerCB();
	    }
	}, 1000);
    }

    ],

    // Callback - print JSON results
    ////////////////////////////////
    function (error) {
        if(error)
            console.log(error);
        res.jsonp(withPaths);
    });

});




module.exports = router;

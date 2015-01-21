var express         = require('express');
var router          = express.Router();
var async           = require('async');

var experiments     = require('./experiments');

var evidence        = require('../models/evidence');
var peptides        = require('../models/peptides');
var proteingroups   = require('../models/proteingroups');
var modspecpeptides = require('../models/modspecpeptides');


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

router.use('/experiments', experiments);

router.get('/', function(req, res) {

    var query     = {};
    var retCols   = {};
    var colsToAdd = [];
    var distinct  = req.query.d;
    var lim       = 10;

    // PARAM SETUP

    //- Q - Query criteria
    try {query     = JSON.parse(req.query.q);}
    catch (e) {res.json({error:"Problem parsing query parameter", exception: e.toString()}); return;}

    //- F - Fields to return
    if (req.query.f != null) {
        try {retCols   = JSON.parse(decodeURIComponent(req.query.f));}
        catch (e) {res.jsonp({error:"Problem parsing return values"}); return;}
    }

    //- COL - Collections to comb
    if (req.query.col == null)
        colsToAdd = ["evidence","modificationSpecificPeptides","peptides","proteinGroups"];
    else
        try {colsToAdd = JSON.parse(req.query.col);}
        catch (e) {res.jsonp({error:"Problem parsing collections"}); return;}

    //- D - Distinct
    if (distinct != null) {
        results = [];
    }
    else results = {};

    //- L - Limit to
    if (req.query.l != null) {
        try {lim = req.query.l;}
        catch (e) {res.json({error:"Problem parsing limit parameter", exception: e.toString()}); return;}
    }

    /////////////////////////////////////////////////////
        /* Two steps to be run in series:
        *    1. Make the calls to the database (in parallel)
        *    2. Unique array and print results
        *    Callback: Print JSON results */
    /////////////////////////////////////////////////////

    // Step 1 - Make DB calls in parallel
    /////////////////////////////////////

    async.parallel([

        // EVIDENCE //
        function (callback) {
            if (colsToAdd.indexOf('evidence') > -1) {
                if (distinct != null) {
                    evidence.distinct(distinct, query, function (error, queryResults) {
                        callback(error, queryResults);
                    });
                }
                else {
                    evidence.find(query, retCols).limit(lim).exec(function (error, queryResults) {
                        callback(error, {evidence: queryResults});
                    });
                }
            }
            else {callback();}
        },

        // MODIFICATION SPECIFIC PEPTIDES //
        function (callback) {
            if (colsToAdd.indexOf('modificationSpecificPeptides') > -1) {
                if (distinct != null) {
                    modspecpeptides.distinct(distinct, query, function (error, queryResults) {
                        callback(error, queryResults);
                    });
                }
                else {
                    modspecpeptides.find(query, retCols).limit(lim).exec(function (error, queryResults) {
                        callback(error, {modificationSpecificPeptides: queryResults});
                    });
                }
            }
            else {callback();}
        },

        // PEPTIDES //
        function (callback) {
            if (colsToAdd.indexOf('peptides') > -1) {
                if (distinct != null) {
                    peptides.distinct(distinct, query, function (error, queryResults) {
                        callback(error, queryResults);
                    });
                }
                else {
                    peptides.find(query, retCols).limit(lim).exec(function (error, queryResults) {
                        callback(error, {peptides: queryResults});
                    });
                }
            }
            else {callback();}
        },

        // PROTEIN GROUPS //
        function (callback) {
            if (colsToAdd.indexOf('proteinGroups') > -1) {
                if (distinct != null) {
                    proteingroups.distinct(distinct, query, function (error, queryResults) {
                        callback(error, queryResults);
                    });
                }
                else {
                    proteingroups.find(query, retCols).limit(lim).exec(function (error, queryResults) {
                        callback(error, {proteinGroups: queryResults});
                    });
                }
            }
            else {callback();}
        }
    ],

    // Step 2 - Unique array and print results
    //////////////////////////////////////////
    
    function (error, asyncResults) {

        if(error)
            console.log(error);

        /*
        if the returned results are arrays, concatenate them and return them.
        Otherwise, package the results up as an object
        */

        var results;

        if (asyncResults[0].constructor === Array) {

            // Combine and uniquify the arrays of results
            results = [];
            asyncResults.forEach(function(res) {
                results = results.concat(res);
            });
            results = results.unique();
            results.sort(function(a, b) {
                if (a.toLowerCase() < b.toLowerCase()) return -1;
                if (a.toLowerCase() > b.toLowerCase()) return 1;
                return 0;
            });

            // Check regex one more time to remove arrayed objects.
            for (var key in query) {

                // Is it a regex or a string?
                if (typeof query[key] == 'string') {
                    var regexp = new RegExp(query[key],'i');
                }
                else {
                    var regexp = new RegExp(query[key]['$regex'],'i');
                }

                var matches = [];
                results.forEach(function(res){
                    if (regexp.test(res)) {
                        matches.push(res);
                    }
                });
                results = matches;
            }
        }

        else {
            results = {};
            asyncResults.forEach(function(res){
                for (var attr in res) {
                    results[attr] = res[attr];
                }
            });
        }

        res.jsonp(results);

    });

});




module.exports = router;

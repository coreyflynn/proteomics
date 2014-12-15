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

router.get('/experiments', experiments)

router.get('/', function(req, res) {
        var query     = {};
        var retCols   = {};
        var colsToAdd = [];
        var related   = req.query.r;

        try {query     = JSON.parse(req.query.q);}
                catch (e) {res.json({error:"Problem parsing query parameter", exception: e.toString()});return;}

    if (req.query.f != null) {
            try {retCols   = JSON.parse(decodeURIComponent(req.query.f));}
                catch (e) {res.jsonp({error:"Problem parsing return values"});return;}
    }

        if (req.query.col == null)
            colsToAdd = ["evidence","modificationSpecificPeptides","peptides","proteinGroups"];
        else
            try {colsToAdd = JSON.parse(req.query.col);}
            catch (e) {res.jsonp({error:"Problem parsing collections"});return;}

        if (distinct != null) {
                results = [];
        }
        else results = {};

    /////////////////////////////////////////////////////
        /* Two steps to be run in series:
        *    1. Make the calls to the database (in parallel)
        *    2. Make array unique
        *    Callback: Print JSON results */
    /////////////////////////////////////////////////////

        async.series([

            // Step 1 - Make DB calls in parallel
        /////////////////////////////////////
            function (outerCB) {
                async.parallel([

        // EVIDENCE //
                    function (callback) {
                        if (colsToAdd.indexOf('evidence') > -1) {
                            if (distinct == null) {
                                    evidence.find(query, retCols, function (error, queryResults) {
                                            results.evidence = queryResults;callback();
                                    });
                            }
                            else {
                                    evidence.distinct(distinct, query, function (error, queryResults) {
                            results = results.concat(queryResults);callback();
                                    });
                            }
                        }
                        else {callback();}
                    },

        // MODIFICATION SPECIFIC PEPTIDES //
                    function (callback) {
                        if (colsToAdd.indexOf('modificationSpecificPeptides') > -1) {
                            if (distinct == null) {
                                    modspecpeptides.find(query, retCols, function (error, queryResults) {
                                            results.modSpecPeptides = queryResults;callback();
                                    });
                            }
                            else {
                                    modspecpeptides.distinct(distinct, query, function (error, queryResults) {
                                        results = results.concat(queryResults);callback();
                    });
                            }
                        }
                        else {callback();}
                    },

        // PEPTIDES //
                    function (callback) {
                        if (colsToAdd.indexOf('peptides') > -1) {
                            if (distinct == null) {
                                    peptides.find(query, retCols, function (error, queryResults) {
                        results.peptides = queryResults;callback();
                                    });
                        }
                            else {
                                    peptides.distinct(distinct, query, function (error, queryResults) {
                                            results = results.concat(queryResults);callback();
                                    });
                            }
                        }
                        else {callback();}
                    },

        // PROTEIN GROUPS //
                    function (callback) {
                        if (colsToAdd.indexOf('proteinGroups') > -1) {
                            if (distinct == null) {
                                    proteingroups.find(query, retCols, function (error, queryResults) {
                                            results.proteinGroups = queryResults;callback();
                                    });
                            }
                            else {
                                    proteingroups.distinct(distinct, query, function (error, queryResults) {
                                            results = results.concat(queryResults);callback();
                                    });
                            }
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
                if (distinct != null) {

                    // Make array unique, then alphabetize.
                    results = results.unique();
                    results.sort(function(a, b) {
                        if (a.toLowerCase() < b.toLowerCase()) return -1;
                        if (a.toLowerCase() > b.toLowerCase()) return 1;
                        return 0;
                    });

                    var space = results.indexOf("");
                    if (space > -1) results.splice(space, 1);
                }
                outerCB();
            }

        ],

        // Callback - print JSON results
        ////////////////////////////////
        function (error) {
                if(error)
                        console.log(error);
            res.jsonp(results);
        });

});




module.exports = router;

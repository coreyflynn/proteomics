var express = require('express');
var router = express.Router();
var experiments = require('../models/experiments');
//var evidence = require('../models/evidence');

/* GET query page. */
router.get('/', function(req, res) {

	var toFind = {};
	if (req.query.q != null) toFind = JSON.parse(req.query.q);
	console.log(toFind);
	console.log(Object.prototype.toString.call(toFind));
	experiments.find(toFind, function(err, results) {
		res.json(results);
	});
});

module.exports = router;

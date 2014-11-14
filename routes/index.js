var express = require('express');
var router = express.Router();
//var experiments = require('../models/experiments');
var evidence = require('../models/evidence');

/* GET home page. */
router.get('/', function(req, res) {
	evidence.find({}, function(err, results) {
		res.json(results);
	});
  //res.render('index', { title: 'Express' });
});

module.exports = router;

var express = require('express');
var router = express.Router();
var experiments = require('../models/experiments');
var search = require('../models/search');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('search', { collections: experiments.db.collections });
});

module.exports = router;

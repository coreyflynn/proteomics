var express = require('express');
var router = express.Router();
var database = require('../database.js');
var search = require('../models/search');

/* GET home page. */
router.get('/', function(req, res) {
	res.render('search', { collections: database.collections });
});

module.exports = router;

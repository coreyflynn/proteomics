var mongoose = require('mongoose');
var database = require('./database.js');

var search = mongoose.model('search', {}, 'search');
module.exports = search;

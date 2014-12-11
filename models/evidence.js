var mongoose = require('mongoose');
var database = require('./database.js');

var evidence = mongoose.model('evidence', {}, 'evidence');
module.exports = evidence;

var mongoose = require('mongoose');
var database = require('./database.js');

var peptides = mongoose.model('peptides', {}, 'peptides');
module.exports = peptides;

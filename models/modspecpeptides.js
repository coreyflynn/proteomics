var mongoose = require('mongoose');
var database = require('./database.js');

var modspecpeptides = mongoose.model('modspecpeptides', {}, 'modificationSpecificPeptides');
module.exports = modspecpeptides;

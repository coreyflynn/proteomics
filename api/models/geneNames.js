var mongoose = require('mongoose');

var geneNames = mongoose.model('geneNames', {}, 'geneNames');
module.exports = geneNames;
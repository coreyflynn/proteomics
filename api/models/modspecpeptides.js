var mongoose = require('mongoose');

var modspecpeptides = mongoose.model('modspecpeptides', {}, 'modificationSpecificPeptides');
module.exports = modspecpeptides;

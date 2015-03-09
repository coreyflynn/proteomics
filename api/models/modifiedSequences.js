var mongoose = require('mongoose');

var modifiedSequences = mongoose.model('modifiedSequences', {}, 'modifiedSequences');
module.exports = modifiedSequences;
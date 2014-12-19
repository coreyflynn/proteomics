var mongoose = require('mongoose');

var evidence = mongoose.model('evidence', {}, 'evidence');
module.exports = evidence;

var mongoose = require('mongoose');

var proteins = mongoose.model('proteins', {}, 'proteins');
module.exports = proteins;
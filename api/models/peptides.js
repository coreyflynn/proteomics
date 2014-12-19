var mongoose = require('mongoose');

var peptides = mongoose.model('peptides', {}, 'peptides');
module.exports = peptides;

var mongoose = require('mongoose');

var experiments = mongoose.model('experiments', {}, 'experiments');
module.exports = experiments;

var mongoose = require('mongoose');

var proteingroups = mongoose.model('proteingroups', {}, 'proteinGroups');

module.exports = proteingroups;

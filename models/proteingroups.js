var mongoose = require('mongoose');
var database = require('./database.js');
//mongoose.connect('mongodb://localhost:27017/proteomics');

var proteingroups = mongoose.model('proteingroups', {}, 'proteinGroups');

module.exports = proteingroups;

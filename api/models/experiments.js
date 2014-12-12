var mongoose = require('mongoose');
var database = require('./database.js');
//mongoose.connect('mongodb://localhost:27017/proteomics');

var Experiment = mongoose.model('Experiment', {path: String}, 'experiments');

module.exports = Experiment;

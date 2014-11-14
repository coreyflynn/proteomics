var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/proteomics');

var Evidence = mongoose.model('Evidence', {}, 'evidence');

module.exports = Evidence;

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/proteomics');


mongoose.connection.on('open', function (ref) {
    mongoose.connection.db.collectionNames(function (err, names) {
	var collections = [];
	
	for (var i = 0; i < names.length; i++) {
	  collections.push(names[i].name);
	}
        module.exports.collections = collections;
    });
})

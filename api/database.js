var mongoose = require('mongoose');

var PROTEOMICS_API_URL = process.env.PROTEOMICS_API_URL;
if (PROTEOMICS_API_URL){
  mongoose.connect('mongodb://' + PROTEOMICS_API_URL + ':27017/proteomics');
}else{
  mongoose.connect('mongodb://localhost:27017/proteomics');
}



mongoose.connection.on('open', function (ref) {
    mongoose.connection.db.collectionNames(function (err, names) {
	var collections = [];

	for (var i = 0; i < names.length; i++) {
	  collections.push(names[i].name);
	}
        module.exports.collections = collections;
    });
})

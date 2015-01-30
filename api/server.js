var app = require('./app');
var mongoose = require('mongoose');

var port = 3000;

app.listen(port, function() {
	console.log("Listening on port " + port);
});

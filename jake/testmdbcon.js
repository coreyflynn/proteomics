var MongoClient = require('mongodb').MongoClient
var assert = require('assert');
var colName = process.argv[2];
var qfName = process.argv[3];
var qvName = process.argv[4];
var totalQ = "'" + qfName + "' : " + qvName + "";
console.log(totalQ);

var url = 'mongodb://localhost:27017/proteomics';
MongoClient.connect(url, function(err,db) {
  if (err) {
    console.log('Error at connection phase');
  }
  assert.equal(null,err);
  console.log('I made it!');
  db.listCollections(function(err,data) {
    if (err) {
      console.log('ERROR!');
    } else {
      console.log(data);
      db.collection(colName, {strict:true}, function(err,c) {
        if (err) {
          console.log(err);
        } else {
          console.log('Collections ret success');
          console.log(qfName + ":" + qvName);
          c.find({}).toArray(function(err, items) {
            console.log(items.length);
            db.close();
          });
        }
      });
    }
  });
});


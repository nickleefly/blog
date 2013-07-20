var db = require('./testdb');
var mongodb = require('mongodb');
var items;
db.get(function(client) {
  items = new mongodb.Collection(client, 'testCollection');
});

// then anywhere in your code
db.get(function() {
  // items.find({ ...
  items.insert({a:3}, {w:1}, function(err, result) {
    if(!err) {
      console.log('inserted')
      console.log(result);
    }
  });
});
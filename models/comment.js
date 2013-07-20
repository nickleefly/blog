var db = require('./db');
var mongodb = require('mongodb');

var items;
db.get(function(client) {
  items = new mongodb.Collection(client, 'posts');
});

function Comment(name, day, title, comment) {
  this.name = name;
  this.day = day;
  this.title = title;
  this.comment = comment;
}

module.exports = Comment;

Comment.prototype.save = function(callback) {
  var name = this.name,
      day = this.day,
      title = this.title,
      comment = this.comment;

  db.get(function() {
    //depend on name time and title add comment
    items.findAndModify({"name":name,"time.day":day,"title":title}
    , [ ['time',-1] ]
    , {$push:{"comments":comment}}
    , {new: true}
    , function (err,comment) {
        callback(null);
    });
  });
};
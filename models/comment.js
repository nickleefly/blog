var mongodb = require('./db');

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

    mongodb.collection('posts', function (err, collection) {
      if (err) {
        return callback(err);
      }
      //depend on name time and title add comment
      collection.findAndModify({"name":name,"time.day":day,"title":title}
      , [ ['time',-1] ]
      , {$push:{"comments":comment}}
      , {new: true}
      , function (err,comment) {
          callback(null);
      });   
    });

};
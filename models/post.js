var mongodb = require('./db');

function Post(name, title, post) {
  this.name = name;
  this.title= title;
  this.post = post;
}

module.exports = Post;

Post.prototype.save = function(callback) {//save content
  var date = new Date();
  //save different time format
  var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth()+1),
      day : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
  }
  //document to save into db
  var post = {
      name: this.name,
      time: time,
      title:this.title,
      post: this.post
  };
  //open db
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //read posts collections
    db.collection('posts', function (err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //insert into posts collection
      collection.insert(post, {
        safe: true
      }, function (err,post) {
        mongodb.close();
        callback(null);
      });
    });
  });
};

Post.get = function(name, callback) {//read article and content
  //open db
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    //read posts collection
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {};
      if (name) {
        query.name = name;
      }
      //search query string
      collection.find(query).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);//failed return null
        }
        callback(null, docs);//success return result in an array
      });
    });
  });
};
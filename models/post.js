var mongodb = require('./db'),
    markdown = require('markdown').markdown;

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
    post: this.post,
    comments: []
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

Post.getTen = function(name, page, callback) {//read article and content
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
      collection.find(query, {skip: (page - 1)*10, limit: 10}).sort({
        time: -1
      }).toArray(function (err, docs) {
        mongodb.close();
        if (err) {
          callback(err, null);//failed return null
        }
				docs.forEach(function(doc) {
				  doc.post = markdown.toHTML(doc.post);
			  });
        callback(null, docs);//success return result in an array
      });
    });
  });
};

Post.getOne = function(name, day, title, callback) { //get one article
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

      // find article according to name time and title
      collection.findOne({"name": name, "time.day": day, "title": title}, function (err, doc) {
        mongodb.close();
        if (err) {
          callback(err, null);
        }
        // render markdown to html
        if(doc){
          doc.post = markdown.toHTML(doc.post);
          doc.comments.forEach(function(comment){
            comment.content = markdown.toHTML(comment.content);
          });
        }
        callback(null, doc); //return article
      });
    });
  });
};

Post.getArchive = function(callback) {//return all articles
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //return array including name, time and title
      collection.find({},{"name":1,"time":1,"title":1}).sort({
        time:-1
      }).toArray(function(err, docs){
        mongodb.close();
        if (err) {
          callback(err, null);
        }
        callback(null, docs);
      });
    });
  });
};

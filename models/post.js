var mongodb = require('./db'),
    markdown = require('markdown').markdown;

function Post(name, head, title, tags, post) {
  this.name = name;
  this.head = head;
  this.title = title;
  this.tags = tags;
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
    head: this.head,
    time: time,
    title:this.title,
    tags: this.tags,
    post: this.post,
    comments: [],
    pv: 0
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
      //increase 1 to pv
      collection.update({"name":name,"time.day":day,"title":title},{$inc:{"pv":1}});
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

Post.getTags = function(callback) {//return tags
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //distinct get different value for specific key
      collection.distinct("tags.tag",function(err, docs){
        mongodb.close();
        if (err) {
          callback(err, null);
        }
        callback(null, docs);
      });
    });
  });
};

Post.getTag = function(tag, callback) {//return all articles for specific tag
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      //return array only include name, time and title
      collection.find({"tags.tag":tag},{"name":1,"time":1,"title":1}).sort({
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

//return articles which have the searched keywords
Post.search = function(keyword, callback) {
  mongodb.open(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var pattern = new RegExp("^.*"+keyword+".*$", "i");
      collection.find({ $or: [ {"title":pattern}, {"post":pattern} ] },{"name":1,"time":1,"title":1}).sort({
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
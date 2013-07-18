var markdown = require('markdown').markdown;
var mongodb = require('./db');
var items;
mongodb.get(function(client) {
  items = new mongodb.Collection(client, 'posts');
});

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

  mongodb.get(function() {
    //insert into posts collection
    items.insert(post, {
      safe: true
    }, function (err,post) {
      callback(null);
    });
  });

};

Post.getTen = function(name, page, callback) {//read article and content

  mongodb.get(function() {
    var query = {};
    if (name) {
      query.name = name;
    }
    //search query string
    items.find(query, {skip: (page - 1)*10, limit: 10}).sort({
      time: -1
    }).toArray(function (err, docs) {
      if (err) {
        callback(err, null);//failed return null
      }
			docs.forEach(function(doc) {
			  doc.post = markdown.toHTML(doc.post);
		  });
      callback(null, docs);//success return result in an array
    });
  });
};

Post.getOne = function(name, day, title, callback) { //get one article

  mongodb.get(function() {
    // find article according to name time and title
    items.findOne({"name": name, "time.day": day, "title": title}, function (err, doc) {
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
    items.update({"name":name,"time.day":day,"title":title},{$inc:{"pv":1}});
  });
};

Post.getArchive = function(callback) {//return all articles
  mongodb.get(function() {
    //return array including name, time and title
    items.find({},{"name":1,"time":1,"title":1}).sort({
      time:-1
    }).toArray(function(err, docs){
      mongodb.close();
      if (err) {
        callback(err, null);
      }
      callback(null, docs);
    });
  });
};

Post.getTags = function(callback) {//return tags
    mongodb.collection('posts', function(err, collection) {
      if (err) {
        return callback(err);
      }
      //distinct get different value for specific key
      items.distinct("tags.tag",function(err, docs){
        if (err) {
          callback(err, null);
        }
        callback(null, docs);
      });
    });
};

Post.getTag = function(tag, callback) {//return all articles for specific tag
  mongodb.get(function() {
    //return array only include name, time and title
    items.find({"tags.tag":tag},{"name":1,"time":1,"title":1}).sort({
      time:-1
    }).toArray(function(err, docs){
      if (err) {
        callback(err, null);
      }
      callback(null, docs);
    });
  });
};

//return articles which have the searched keywords
Post.search = function(keyword, callback) {
    mongodb.get(function() {
    var pattern = new RegExp("^.*"+keyword+".*$", "i");
    items.find({ $or: [ {"title":pattern}, {"post":pattern} ] },{"name":1,"time":1,"title":1}).sort({
      time:-1
    }).toArray(function(err, docs){
       if (err) {
       callback(err, null);
      }
      callback(null, docs);
    });
  });
};
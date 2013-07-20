var db = require('./db');
var mongodb = require('mongodb');

var items;
db.get(function(client) {
  items = new mongodb.Collection(client, 'users');
});

function User(user){
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
};

module.exports = User;

User.prototype.save = function(callback) {//save user information
  //document to save in db
  var user = {
      name: this.name,
      password: this.password,
      email: this.email
  };

  db.get(function() {
    //insert data into users collections
    items.insert(user,{safe: true}, function(err, user){
      callback(err, user);//success return inserted user information
    });
  });

};

User.get = function(name, callback){//read user information
  db.get(function() {
    //search name 
    items.findOne({
      name: name
    },function(err, doc){
      if(doc){
        var user = new User(doc);
        callback(err, user);//success return searched user
      } else {
        callback(err, null);//failed return null
      }
    });
  });
};
var mongodb = require('./db');

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
  //open mongodb database
  mongodb.open(function(err, db){
    if(err){
      return callback(err);
    }
    //read users collection
    db.collection('users', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      //insert data into users collections
      collection.insert(user,{safe: true}, function(err, user){
        mongodb.close();
        callback(err, user);//success return inserted user information
      });
    });
  });
};

User.get = function(name, callback){//read user information
  //open db
  mongodb.open(function(err, db){
    if(err){
      return callback(err);
    }
    //read users collections
    db.collection('users', function(err, collection){
      if(err){
        mongodb.close();
        return callback(err);
      }
      //search name 
      collection.findOne({
        name: name
      },function(err, doc){
        mongodb.close();
        if(doc){
          var user = new User(doc);
          callback(err, user);//success return searched user
        } else {
          callback(err, null);//failed return null
        }
      });
    });
  });
};
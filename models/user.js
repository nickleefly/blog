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

    //read users collection
    mongodb.collection('users', function(err, collection){
      if(err){
        return callback(err);
      }
      //insert data into users collections
      collection.insert(user,{safe: true}, function(err, user){
        callback(err, user);//success return inserted user information
      });
    });

};

User.get = function(name, callback){//read user information

    //read users collections
    mongodb.collection('users', function(err, collection){
      if(err){
        return callback(err);
      }
      //search name 
      collection.findOne({
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

/*
 * GET home page.
 */
var crypto = require('crypto'),
    User = require('../models/user.js');

module.exports = function(app){
  app.get('/',function(req,res){
    res.render('index', { title: 'home' });
  });
  app.get('/reg',function(req,res){
    res.render('reg', { title: 'register' });
  });

  app.post('/reg', function(req,res){
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'];
    //check if password matches
    if(password_re != password){
      req.flash('error','password does not match!'); 
      return res.redirect('/reg');
    }
    //generate password sha
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
        name: req.body.name,
        password: password,
        email: req.body.email
    });
    //check if user existed
    User.get(newUser.name, function(err, user){
      if(user){
        err = 'user already existed!';
      }
      if(err){
        req.flash('error', err);
        return res.redirect('/reg');
      }
      //if not insert a new user
      newUser.save(function(err){
        if(err){
          req.flash('error',err);
          return res.redirect('/reg');
        }
        req.session.user = newUser;//save user information into session
        req.flash('success','register success!');
        res.redirect('/');
      });
    });
  });

  app.get('/login',function(req,res){
    res.render('login', { title: 'login' });
  });
  app.post('/login',function(req,res){
  });
  app.get('/post',function(req,res){
    res.render('post', { title: 'post' });
  });
  app.post('/post',function(req,res){
  });
  app.get('/logout',function(req,res){
  });
};
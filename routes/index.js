
/*
 * GET home page.
 */
var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js');

module.exports = function(app){
  app.get('/', function(req,res){
    Post.getAll(null, function(err, posts){
      if(err){
        posts = [];
      } 
      res.render('index',{
        title: 'home',
        user: req.session.user,
        posts: posts,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/reg', checkNotLogin);
  app.get('/reg',function(req,res){
    res.render('reg', {
      title: 'register',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/reg', checkNotLogin);
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

  app.get('/login', checkNotLogin);
  app.get('/login', function(req, res){
    res.render('login',{
      title: 'login',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    }); 
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function(req, res){
    //generate md5 sha
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    //check if user exists
    User.get(req.body.name, function(err, user){
      if(!user){
        req.flash('error', 'user doesn\'t exists!'); 
        return res.redirect('/login'); 
      }
      //check if password matches
      if(user.password != password){
        req.flash('error', 'password doesn\'s match!'); 
        return res.redirect('/login');
      }
      //save user into session
      req.session.user = user;
      req.flash('success','successful login!');
      res.redirect('/');
    });
  });

  app.get('/post', checkLogin);
  app.get('/post',function(req,res){
    res.render('post', {
      title: 'post',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/post', checkLogin);
  app.post('/post', function(req, res){
    var currentUser = req.session.user,
        post = new Post(currentUser.name, req.body.title, req.body.post);
    post.save(function(err){
      if(err){
        req.flash('error', err); 
        return res.redirect('/');
      }
      req.flash('success', 'successful posted!');
      res.redirect('/');
    });
  });

  app.get('/logout', checkLogin);
  app.get('/logout', function(req, res){
    req.session.user = null;
    req.flash('success','successful logout!');
    res.redirect('/');
  });
  app.get('u/:name', function(req, res){
    //check if use exists
    User.get(req.params.name, function(err, user) {
      if(!user){
        req.flash('error', 'user doesn\'t exist');
        return res.redirect('/');
      }
      //return all user article
      Post.getAll(user.name, function(err, posts){
        if(err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        res.render('user', {
          title: user.name,
          posts: posts,
          user : req.session.user,
          success : req.flash('success').toString(),
          error : req.flash('error').toString()
        });
      });
    });
  });
  app.get('u/:name/:day/:title', function(req, res){
    Post.getOne(req.params.name, req.params.day, req.params.title, function(err, post){
      if(err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('article', {
        title: req.params.title,
        posts: post,
        user : req.session.user,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      });
    });
  });

};

function checkLogin(req, res, next){
  if(!req.session.user){
    req.flash('error','didn\'t login!'); 
    return res.redirect('/login');
  }
  next();
}

function checkNotLogin(req,res,next){
  if(req.session.user){
    req.flash('error','logged in!'); 
    return res.redirect('/');
  }
  next();
}

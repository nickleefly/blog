
/*
 * GET home page.
 */
var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js'),
    Comment = require('../models/comment.js');

module.exports = function(app){
  // check if its first page, change pages into number
  app.get('/', function(req,res){
    var page = req.query.p?parseInt(req.query.p):1;
    Post.getTen(null, page, function(err, posts){
      if(err){
        posts = [];
      } 
      res.render('index',{
        title: 'home',
        user: req.session.user,
        posts: posts,
        page: page,
        postsLen: posts.length,
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
        tags = [{"tag":req.body.tag1},{"tag":req.body.tag2},{"tag":req.body.tag3}],
        post = new Post(currentUser.name, req.body.title, tags, req.body.post);
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

  app.get('/links', function(req,res){
    res.render('links',{
      title: 'friend links',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.get('/search', function(req,res){
    Post.search(req.query.keyword, function(err, posts){
      if(err){
        req.flash('error',err); 
        return res.redirect('/');
      }
      res.render('search',{
        title: "SEARCH:"+req.query.keyword,
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/u/:name', function(req,res){
    var page = req.query.p?parseInt(req.query.p):1;
    //check if use exists
    User.get(req.params.name, function(err, user){
      if(!user){
        req.flash('error','user doesn\' exist');
        return res.redirect('/');
      }
      //return all user article
      Post.getTen(user.name, page, function(err, posts){
        if(err){
          req.flash('error',err);
          return res.redirect('/');
        }
        res.render('user',{
          title: user.name,
          posts: posts,
          page: page,
          postsLen: posts.length,
          user : req.session.user,
          success : req.flash('success').toString(),
          error : req.flash('error').toString()
        });
      });
    }); 
  });

  app.get('/archive', function(req,res){
    Post.getArchive(function(err, posts){
      if(err){
        req.flash('error',err); 
        return res.redirect('/');
      }
      res.render('archive',{
        title: 'archive',
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/tags', function(req,res){
    Post.getTags(function(err, posts){
      if(err){
        req.flash('error',err); 
        return res.redirect('/');
      }
      res.render('tags',{
        title: 'tags',
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/tags/:tag', function(req,res){
    Post.getTag(req.params.tag, function(err, posts){
      if(err){
        req.flash('error',err); 
        return res.redirect('/');
      }
      res.render('tag',{
        title: 'TAG:'+req.params.tag,
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.get('/u/:name/:day/:title', function(req,res){
    Post.getOne(req.params.name, req.params.day, req.params.title, function(err, post){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render('article',{
        title: req.params.title,
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

  app.post('/u/:name/:day/:title', function(req,res){
    var date = new Date(),
        time = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes(),
        comment = {"name":req.body.name, "email":req.body.email, "website":req.body.website, "time":time, "content":req.body.content};
    var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
    newComment.save(function(err){
      if(err){
        req.flash('error',err); 
        return res.redirect('/');
      }
      req.flash('success', 'comment succeed!');
      res.redirect('back');
    });
  });

  app.get('/404', function(req, res, next){
    // trigger a 404 since no other middleware
    // will match /404 after this one, and we're not
    // responding here
    next();
  });

  app.get('/403', function(req, res, next){
    // trigger a 403 error
    var err = new Error('not allowed!');
    err.status = 403;
    next(err);
  });

  app.get('/500', function(req, res, next){
    // trigger a generic (500) error
    next(new Error('keyboard cat!'));
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

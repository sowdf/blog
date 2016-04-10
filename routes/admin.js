var Admin = require('../modules/admin'),
    Post = require('../modules/post'),
    crypto = require('crypto');

/* GET home page. */
module.exports = function(app){
  app.get('/reg',checkNotLogin);
  app.get('/reg',function(req,res){
    res.render('reg',{title:'注册'})
  });
  app.post('/reg',checkNotLogin);
  app.post('/reg',function(req,res){
    var name = req.body.name,
        password = req.body.password,
        email = req.body.email;
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newAdmin = new Admin({
      name : name,
      password : password,
      email : email
    })
    Admin.get(newAdmin.name,function(err,admin){
      if(err){
        req.flash('error',err);
        return res.redirect('/admin');
      }
      if(admin){
        req.flash('error','用户已存在');
        return req.redirect('/admin')
      }
      newAdmin.save(function(err,admin){
        if(err){
          req.flash('error',err);
          return res.redirect('/admin');
        }
        req.session.admin = newAdmin;
        req.flash('success','注册成功！');
        res.redirect('/admin');
      })
    })
  })
  app.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
  });

  app.get('/admin',checkNotLogin);
  app.get('/admin',function(req,res){
    res.render('admin',{
      title:'后台登陆',
      success : req.flash('success').toString(),
      error : req.flash('error').toString()
    });

  });
  app.post('/admin',checkNotLogin);
  app.post('/admin',function(req,res){
    /* 生成md5 加密 */
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    Admin.get(req.body.name,function(err,admin){
      if(err){
        return req.flash('error',err);
        return res.redirect('/admin');
      }
      if(admin.password != password){
        req.flash('error','密码错误！');
        return res.redirect('/admin');
      }
      req.session.admin = admin;
      req.flash('success','登陆成功！');
      res.redirect('/manage');
    })
  });
  app.get('/manage',checkLogin);
  app.get('/manage',function(req,res){
    Post.get(null,function(err,posts){
      if(err){
        posts = [];
      }
      res.render('manage',{
        title:'后台管理页',
        posts : posts,
        admin : req.session.admin,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      })
    })

  });
  app.get('/logout',checkLogin);
  app.get('/logout',function(req,res){
    req.flash('success','退出成功！');
    req.session.admin = null;
    res.redirect('/admin');
  });
  app.get('/upload', checkLogin);
  app.get('/upload', function (req, res) {
    res.render('upload', {
      title: '文件上传',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  app.post('/upload', checkLogin);
  app.post('/upload', function (req, res) {
    req.flash('success', '文件上传成功!');
    res.redirect('/upload');
  });
  app.get('/post',checkLogin);
  app.get('/post',function(req,res){
    res.render('post',{
      title:'发表',
      success : req.flash('success').toString(),
      error : req.flash('error').toString()
    });
  });
  app.post('/post',checkLogin);
  app.post('/post',function(req,res){
    var currentAdmin = req.session.admin,
        post = new Post(currentAdmin.name,req.body.title,req.body.post,req.body.image);
    post.save(function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('/post');
      }
      req.flash('success','发表成功！');
      res.redirect('/manage');
    });
  });
  function checkLogin(req,res,next){
    if(!req.session.admin){
      req.flash('error','您尚未登录');
      return res.redirect('/admin');
    }
    next();
  }
  function checkNotLogin(req,res,next){
    if(req.session.admin){
      req.flash('error','您已登录');
      return res.redirect('/manage');
    }
    next();
  }
}



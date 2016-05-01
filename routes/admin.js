var Admin = require('../modules/admin'),
    Post = require('../modules/post'),
    List = require('../modules/list'),
    crypto = require('crypto');

var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb){
    cb(null, './public/artimage')
  },
  filename: function (req, file, cb){
    var fileName = file.originalname;
    var arr =fileName.split('.');
    var time = new Date().getTime() + '.';
    fileNmae = arr.join(time);
    file.originalname = fileNmae;
    cb(null, file.originalname);
  }
});
var upload = multer({
  storage: storage
});

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
      if(admin){
        if(admin.password != password){
          req.flash('error','密码错误！');
          return res.redirect('/admin');
        }
        req.session.admin = admin;
        req.flash('success','登陆成功！');
        res.redirect('/manage');
      }else{
        req.flash('error','该账号不存在！');
        return res.redirect('/admin');
      }


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
  app.post('/upload',upload.array('field1', 5), function (req, res) {
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
  app.post('/post',upload.array('field1', 5),function(req,res){
    var currentAdmin = req.session.admin,
        imgPath = 'http://srs.sowdf.com/' + req.files[0].originalname,
        post = new Post(currentAdmin.name,req.body.title,req.body.post,req.body.image,imgPath);
    post.save(function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('/post');
      }
      req.flash('success','发表成功！');
      res.redirect('/manage');
    });
  });
  /* 获取列表文章 */
  app.get('/list',checkLogin);
  app.get('/list',function(req,res){
    var name = req.session.admin.name;
    var newList = new List(name);
    List.get(name,function(err,list){
      if(err){
        req.flash('error',err);
        return res.redirect('/manage');
      }
      res.render('list',{
        title : '列表页',
        list : list,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      })

    });
  });
  app.get('/edit/:day/:title',checkLogin);
  app.get('/edit/:day/:title',function(req,res){
    var currentAdmin = req.session.admin;
    List.edit(currentAdmin.name,req.params.day,req.params.title,function(err,doc){
      if(err){
        req.flash('error',err);
        return res.redirect('/list');
      }
      res.render('edit',{
        title : '编辑',
        post : doc,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      })
    })
  });
  app.post('/edit/:day/:title',checkLogin)
  app.post('/edit/:day/:title',function(req,res){
    var name = req.session.admin.name,
        day = req.params.day,
        title = req.params.title,
        post = req.body.post;
    var url = encodeURI('/article/'+ day +'/'+title);
    List.update(name,day,title,post,function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('/list');
      }
      req.flash('success','保存成功！');
      return res.redirect(url);
    });
  });
  app.get('/article/:day/:title',checkLogin);
  app.get('/article/:day/:title',function(req,res){
    var name = req.session.admin.name,
        day = req.params.day,
        title = req.params.title;
    Post.getOne(name,day,title,function(err,doc){
      if(err){
        req.flash('error',err);
        return res.redirect('/list');
      }
      res.render('article',{
        title : '文章内容',
        post : doc,
        success : req.flash('success').toString(),
        error : req.flash('error').toString()
      })
    })
  });
  app.get('/remove/:day/:title',checkLogin);
  app.get('/remove/:day/:title',function(req,res){
    var name = req.session.admin.name,
        day = req.params.day,
        title = req.params.title;
    List.remove(name,day,title,function(err){
      if(err){
        req.flash('error',err);
        return res.redirect('/list');
      }
      req.flash('success','删除成功！');
      res.redirect('/list');
    })
  })
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



var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var routeUser = require('./routes/user');
var routeAdmin = require('./routes/admin');
var settings = require('./settings');
var flash = require('connect-flash');
var app = express();

// view engine setup
app.set('port',process.env.port || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
/*multer({
 dest : './public/images',
 rename : function(fieldname,filename){
     console.log(fieldname);
     console.log(filename);
 return fieldname;
 }
});*/




app.use(flash());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret : settings.cookieSecret,
  key : settings.db,
  cookie : {maxAge:60 * 60 * 1000 * 24 * 30},
  store : new MongoStore({
    db:settings.db,
    host:settings.host,
    port:settings.port,
    url:'mongodb://localhost/sowdf'
  })
}));

routeUser(app);
routeAdmin(app);

app.listen(app.get('port'),function(){
  console.log('express start on port '+ app.get('port'));
});

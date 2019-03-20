// 没有封装太多的功能，而是按需加载的形式， 引入自己需要的中间件

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser'); //body-parser middleware //
var swig = require('swig'); // swig templete //
var session = require('express-session'); // seesion //
var flash = require('connect-flash'); // flash messages
var cookieParser = require('cookie-parser'); // for flash message session cookie

var mongoose = require('mongoose'); // 加载mongoose
mongoose.connect('mongodb+srv://shihchun:root1234@cluster0-wq6f0.mongodb.net/shop?retryWrites=true', { useNewUrlParser: true });
console.log('MongoDB connection success!');

// passport 認證加密套件 require session //
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// include other Routers //
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup: swig //
app.engine('html', swig.renderFile); 
app.set('view engine', 'html'); 
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1) // trust first proxy

app.use(bodyParser.urlencoded({extended: true})); // body-parser //
app.use(bodyParser.json()); // body-parser //
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


/*                               _         __ _           _     
  ___ ___  _ __  _ __   ___  ___| |_      / _| | __ _ ___| |__  
 / __/ _ \| '_ \| '_ \ / _ \/ __| __|____| |_| |/ _` / __| '_ \ 
| (_| (_) | | | | | | |  __/ (__| ||_____|  _| | (_| \__ \ | | |
 \___\___/|_| |_|_| |_|\___|\___|\__|    |_| |_|\__,_|___/_| |_|
 
// set express-session + (現在版本要用cookie-parser輔助)
// 因為Cookie 具有不可跨域名性
// cookie/Session的機制較為安全
// maxAge 持續時間單位毫秒，PHP預設20分鐘，數值要是數字，不行 60 * 1000
// app.use(session({cookie: { maxAge: 60000 }})); // 加入 secret 和 maxAge(session 時間)
// app.use(session({ 
//   // path: '/admin',
//   // store: new FileStore(),  // 安裝fs文本儲存session（store，如：redis緩存、mongodb、文本）
//   //secret recommand 128 bytes random string //
//  }
*/

app.use(cookieParser('secret'));
var cookieID = Math.random().toString(36).substring(2, 15); //radom value

app.use(session({ 
  // path: '/admin',
	name: cookieID,
	// store: new FileStore(),  // 安裝fs文本儲存session（store，如：redis緩存、mongodb、文本）
	//secret recommand 128 bytes random string //
	secret: makeSecret(), // 秘鑰對session id相關的cookie簽名
	resave: false, // 是否保存session會話
	saveUninitialized: false, // 是否保存未初始化的session
	cookie: { maxAge: 60000, /*secure: true,用了會沒cookie*/  }
}))
app.use(flash()); // initial connect flash with session 60sec

// console.log(makeSecret()); // generate secret 128 strings
function makeSecret() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrswxyz1234567890-=`~!@#$%^&*()_+}{;:/?><.,";
  for (var i = 0; i < 127; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  // // make uuid 數字和小寫英文 數學轉科學符號再去掉兩位0.ahhj
  // Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  // Math.random() 產生0.xxxx的數字，乘上100之類的可以產生亂數
  return text;
}

// passport.js middleware inisial setting //
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter); // use adminRouter '/' as '/admin' //

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

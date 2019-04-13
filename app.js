const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const swig = require('swig');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const f = require('./models/functions.js');

const mongoose = require('mongoose'); // 加载mongoose來操作mongodb
// mongoose.connect('mongodb+srv://shihchun:root1234@cluster0-wq6f0.mongodb.net/shop?retryWrites=true', {useNewUrlParser: true});
mongoose.connect('mongodb://localhost:27017/shopping-site', {useNewUrlParser: true});
console.log('MongoDB connection success!');

// passport 認證加密套件 require session //
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// include other Routers //
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');


const app = express();
console.log("\n>>>> app initial " + `Cmd Working directory:\n ${process.cwd()}`);

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1) // trust first proxy


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(logger('dev')); // pruduction mode have better performance
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());
app.use(cookieParser('secret'));

var ID = f.makeSecret();
var cookieID = ID.uuid; //radom value
var Secret = ID.secret;
app.use(flash()); // initial connect flash with session 60sec
app.use(session({
  // path: '/admin',
  name: cookieID,
  // store: new FileStore(),  // 安裝fs文本儲存session（store，如：redis緩存、mongodb、文本）
  //secret recommand 128 bytes random string //
  secret: Secret,
  resave: false, // 是否保存session會話
  saveUninitialized: false, // 是否保存未初始化的session
  cookie: {
    maxAge: 60000,
    /*secure: true,用了會沒cookie*/
  }
}));

// passport.js middleware inisial setting //
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter); // use adminRouter '/' as '/admin' //

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
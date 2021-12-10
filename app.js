var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
const session = require('express-session');
const passport = require('passport');
const flash    = require('connect-flash');
const GitHubStrategy = require('passport-github').Strategy;
const LocalStrategy = require('passport-local').Strategy;

// const helmet = require('helmet');

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var projectOwnerPageRouter = require('./routes/projectOwnerPage');
const accountsRouter = require('./routes/accounts');
const adminRouter = require('./routes/admin');
const con = require('./modules/dbConnect');
const passportConfig = require('./config');
require('./modules/passport')(passport);

// con.connect((err) => {
//   if(err) throw err;
//   console.log("Connected")
// })

var app = express();

// app.use(helmet())
app.use(logger('dev'));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: "debous",
  resave: false,
  saveUninitialized: true,
}))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) return next();
  res.redirect("/");
}

function isLoggedOut (req, res, next) {
  if(!req.isAuthenticated()) return next();
  res.redirect("/");
}

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/accounts', accountsRouter);
app.use('/projectOwner', projectOwnerPageRouter);
app.use('/admin', adminRouter);

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

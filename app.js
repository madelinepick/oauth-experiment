var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var passport = require('passport');
require('dotenv').load();
var cookieSession = require('cookie-session');


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_KEY]
}));
app.use(express.static(path.join(__dirname, 'public')));

passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.HOST + "/auth/linkedin/callback",
  scope: ['r_emailaddress', 'r_basicprofile'],
  state: true
}, function(accessToken, refreshToken, profile, done) {
  done(null, {id: profile.id, displayName: profile.displayName, token: accessToken})
}));


app.get('/auth/linkedin',
  passport.authenticate('linkedin'),
  function(req, res){
    // The request will be redirected to LinkedIn for authentication, so this
    // function will not be called.
  });

app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
    successRedirect: '/',
    failureRedirect: '/login'
}));



passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user)
});

app.use(function (req, res, next) {
  if (!req.session.passport) {
    app.locals.user = null;
  }else {
    app.locals.user = req.session.passport.user;
  }
  next()
})


app.use('/', routes);
app.use('/users', users);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

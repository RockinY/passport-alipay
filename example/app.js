require('dotenv').config()
var express = require('express');
var passport = require('passport');
var util = require('util');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var AlipayStrategy = require('../').Strategy;
var partials = require('express-partials');
var debug = require('debug')('passport-alipay');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new AlipayStrategy({
    app_id: process.env.ALIPAY_OAUTH_CLIENT_ID,
    alipay_public_key: process.env.ALIPAY_OAUTH_PUBLIC_KEY,
    private_key: process.env.ALIPAY_OAUTH_PRIVATE_KEY,
    callbackURL: process.env.ALIPAY_OAUTH_CALLBACK_URL,
    scope: 'auth_user',
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

var app = express();

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});


app.get('/auth/alipay',
  passport.authenticate('Alipay', { scope: 'auth_user' }),
  function(req, res){}
);

app.get('/auth/alipay/callback', 
  passport.authenticate('Alipay', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3000);
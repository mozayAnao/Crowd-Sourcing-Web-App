var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', isLoggedOut, function(req, res, next) {
  res.set("Content-Security-Policy", "")
  res.render('index', { message: req.flash('loginMessage') });
});

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) return next();
  res.redirect("/");
}

function isLoggedOut (req, res, next) {
  if(!req.isAuthenticated()) return next();
  res.redirect(req.originalUrl);
}
module.exports = router;

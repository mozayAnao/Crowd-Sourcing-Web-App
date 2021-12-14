var express = require('express');
var router = express.Router();
const auth = require('../modules/authenticate');

/* GET home page. */
router.get('/', auth.isLoggedOut, function(req, res, next) {
  res.set("Content-Security-Policy", "")
  res.render('index', { message: req.flash('loginMessage') });
});

module.exports = router;

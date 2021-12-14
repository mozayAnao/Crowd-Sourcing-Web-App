var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
    req.logout();
    res.clearCookie('connect.sid');
    res.redirect('/admin');
  });

  module.exports = router;
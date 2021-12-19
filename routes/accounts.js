var express = require('express');
var router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt-nodejs');
const con = require('../modules/dbConnect');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/settings', function(req, res, next) {
    console.log(req.user)
        var sql = `INSERT INTO api_users (userId, apiHost) VALUES ('${req.user.apiUserId}', '${req.user.provider}')`;
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("1 record inserted");
          res.render('accountInfo', { 
            user: req.user
          });
        });   
    
});

  router.post('/newuser', function(req, res, next) {
    const userId = "PO"+uuidv4()
    const roleId = "4"  
    
      var sql = `INSERT INTO users (id, name, email, phoneNumber, roleId, apiUserId) VALUES ('${userId}', '${req.body.userName}', '${req.body.email}', '${req.body.phoneCode}', '${roleId}', '${req.query.apiUserId}')`;
      
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
      });
      
    res.redirect('/projectOwner');
  });

  router.post('/save', function(req, res, next) {
    const userId = "PO"+uuidv4()
    const roleId = "4"  
    
      var sql = `INSERT INTO users (id, name, email, phoneNumber, roleId) VALUES ('${userId}', '${req.body.name}', '${req.body.email}', '${req.body.phoneCode}', '${roleId}')`;
      
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        bcrypt.genSalt(10, function (err, salt) {
          if(err) return next(err);
          bcrypt.hash(req.body.password, salt, function(err, hash) {
              if(err) return next(err);
              var sql2 = `INSERT INTO login_table (userId, username, password) VALUES ('${userId}', '${req.body.email}', '${hash}')`;
              con.query(sql2, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
                res.redirect(`/projectOwner?username=${req.body.name}`);
              });
      });
      
    });   
      
    });
  });

module.exports = router;

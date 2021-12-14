var express = require('express');
var router = express.Router();
const passport = require('passport');
const { v4: uuidv4 } = require('uuid');
const con = require('../modules/dbConnect');
const mailer = require('../modules/mailer');
const auth = require('../modules/authenticate');
const bcrypt = require('bcrypt-nodejs');

router.get('/', auth.isLoggedOut, function(req, res, next) {
  res.render('adminLogin', { message: req.flash('loginMessage') });
});

router.get('/dashboard', auth.isLoggedIn, function(req, res, next) {
  var sql = `SELECT project_details.id AS id, project_details.title AS title, project_details.description AS description, project_details.organizationName AS organization, project_details.fundCampaignstartDate, project_details.fundCampaignEndDate, project_details.statusId AS projectStatusId, project_funding.amountRequired, project_funding.amountRecieved, project_funding.currencyId, addresses.country, users.name, users.email, users.phoneNumber FROM project_details JOIN project_funding ON project_details.id = project_funding.projectId JOIN addresses on project_funding.projectId = addresses.id JOIN users on project_details.projectOwnerId = users.id`;
  var sql2 = "SELECT COUNT(*) FROM users WHERE roleId < 4";
  var sql3 = "SELECT COUNT(*) FROM users WHERE roleId = 4";
  var sql4 = "SELECT COUNT(*) FROM project_details WHERE statusId = 1";
  var sql5 = "SELECT COUNT(*) FROM project_details WHERE statusId = 2";
  con.query(sql2, function(err, userCount) {
    if(err) throw err;
    console.log(userCount)
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);
      con.query(sql3, function (err, projectOwner) {
        if (err) throw err;
        console.log(projectOwner);
        con.query(sql4, function (err, newProject) {
          if (err) throw err;
          console.log(newProject);
          con.query(sql5, function (err, reviewedProject) {
            if (err) throw err;
            console.log(reviewedProject);
            res.render('adminDashboard', { 
              user : req.user,
              projects: result,
              userCount: userCount,
              poCount: projectOwner,
              newProject: newProject,
              reviewedProject: reviewedProject 
            })
         });
       });
     });
   });
  }) 
});

router.get('/addUser', auth.isLoggedIn, function(req, res, next) {
  res.render('addUser', {
    user: req.user,
    message: req.query.msg,
    messageId: req.query.id
  });
});

router.post('/saveUser', auth.isLoggedIn, function(req, res, next) {
  console.log(req.body)
  userId = "AD"+uuidv4();
  var chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var passwordLength = 6;
  var password = "";
  for (var i = 0; i <= passwordLength; i++) {
    var randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber +1);
   }
  var sql = "INSERT INTO users (id, name, email, phoneNumber, roleId) VALUES (?,?,?,?,?)"
  var sql2 = "INSERT INTO login_table (userId, username, password) VALUES (?,?,?)"
  con.query("SELECT * FROM login_table WHERE username = ?",[req.body.email], function(err, rows) {
    if (err)
        console.log(err);
    if (rows.length) {
      res.redirect('/admin/addUser?msg=This email is already taken.&id=1')
    } else {
        con.query(sql, [userId, req.body.name, req.body.email, req.body.phoneCode, req.body.role],function (err, result) {
          if (err) throw err;
          console.log("user record inserted");
          con.query(sql2, [userId, req.body.email, bcrypt.hashSync(password, null, null)], function (err, result) {
            if (err) throw err;
            console.log("login record inserted");
            const receipient = req.body.email;
            const subject =  `Welcome to MNFundAfric`;
            const html = `<div><p>Hi! ${req.body.name}, you have been included an admin at MNFundAfric. Here is your password; <b>${password}</b>. Please change your password when you login.</p></div> <div><p><a href="localhost:5000/admin">Click here</a> to login with your email and password.</p></div>`
            mailer(receipient, subject, html);
            res.redirect('/admin/addUser?msg=User created Successfully!!&id=2')
          });
        });
    }
  })
});

router.get('/manageUsers', auth.isLoggedIn, function(req, res, next) {
  const sql = `SELECT users.id, users.name, users.email, users.phoneNumber, users.roleId, roles.role FROM users LEFT JOIN roles on users.roleId = roles.id`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result)
    res.render('manageUsers', {
      user: req.user,
      users: result
    });
  })
});

router.get('/editUser', auth.isLoggedIn, function(req, res, next) {
  const sql = `SELECT users.id, users.name, users.email, users.phoneNumber, users.roleId, roles.role FROM users LEFT JOIN roles on users.roleId = roles.id WHERE users.id = ${req.query.id}`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result)
    res.render('editUser', {
      user: req.user,
      result: result,
      message: req.query.msg
    });
  })
});

router.post('/updateUser', auth.isLoggedIn, function(req, res, next) {
  console.log(req.body)
  const sql = `UPDATE users SET name = "${req.body.name}", email = "${req.body.email}", phoneNumber = "${req.body.phoneCode}", roleId = "${req.body.role}" WHERE id = '${req.query.id}'`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result)
    res.redirect(`/admin/editUser?id='${req.query.id}'&msg=Update Successful!!`)
  })
});

router.get('/delete', auth.isLoggedIn, function(req, res, next) {
    res.render('deleteUser', {
      user: req.user,
      userName: req.query.name,
      userId: req.query.id
  })
});

router.post('/deleteUser', auth.isLoggedIn, function(req, res, next) {
  console.log(req.body)
  const sql = `DELETE FROM users WHERE id = '${req.body.userId}'`;
  const sql2 = `DELETE FROM login_table WHERE userId = '${req.body.userId}'`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result)
    con.query(sql2, function (err, result) {
      if (err) throw err;
      console.log(result)
      res.redirect(`/admin/manageUsers`)
    })
  })
});

router.get('/newProjects', auth.isLoggedIn, function(req, res, next) {
  var sql = `SELECT project_details.id AS id, project_details.title AS title, project_details.description AS description, project_details.fundCampaignstartDate, project_details.fundCampaignEndDate, project_details.statusId AS projectStatusId, project_funding.amountRequired, project_funding.amountRecieved, project_funding.currencyId, photos.projectId, photos.path FROM project_details JOIN project_funding ON project_details.id = project_funding.projectId JOIN photos on project_funding.projectId = photos.projectId WHERE project_details.statusId = '1' GROUP BY photos.projectId`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
    res.render('newProjects', { 
      user : req.user,
      projects: result 
    })
  });
  
});

router.get('/newProject', auth.isLoggedIn, function(req, res, next) {
  var sql = `SELECT * FROM project_details WHERE id = '${req.query.id}'`;
  var sql2 = `SELECT * FROM project_funding WHERE projectId = '${req.query.id}'`;
  var sql3 = `SELECT * FROM photos WHERE projectId = '${req.query.id}'`;
  var sql4 = `SELECT * FROM addresses WHERE id = '${req.query.id}'`;
  var sql5 = `SELECT * FROM social_media_links WHERE projectId = '${req.query.id}'`;
  var sql6 = `SELECT users.id AS userId, users.name, users.email, users.phoneNumber, project_details.id FROM users JOIN project_details ON users.id = project_details.projectOwnerId WHERE project_details.id = '${req.query.id}'`;
  var sql7 = `SELECT * FROM users WHERE roleId = '3'`;
  con.query(sql, function (err, projectDetails) {
    if (err) throw err;
    console.log(projectDetails);
    con.query(sql2, function (err, projectFunding) {
      if (err) throw err;
      console.log(projectFunding);
      con.query(sql3, function (err, photos) {
        if (err) throw err;
        console.log(photos);
        con.query(sql4, function (err, address) {
          if (err) throw err;
          console.log(address);
          con.query(sql5, function (err, socialMedia) {
            if (err) throw err;
            console.log(socialMedia);
            con.query(sql6, function (err, projectOwner) {
              if (err) throw err;
              console.log(projectOwner);
              con.query(sql7, function (err, reviewers) {
                if (err) throw err;
                console.log(reviewers);
                res.render('newProject', { 
                  user : req.user,
                  projectDetails: projectDetails,
                  projectFunding: projectFunding,
                  photos: photos,
                  address: address,
                  socialMedia: socialMedia,
                  projectOwner: projectOwner,
                  reviewers: reviewers
                });
              });
            })
          });
        });
      });
    })
  }); 
});

router.post('/assignReviewer', auth.isLoggedIn, function(req, res, next) {
  console.log(req.body)
  const sql = `INSERT INTO project_review (projectId, reviewerId) VALUES (?,?)`;
  const sql2 = `UPDATE project_details SET statusId = '6' WHERE id = '${req.body.projectId}'`;
  con.query(sql, [req.body.projectId, req.body.reviewerId], function (err, result) {
    if (err) throw err;
    console.log(result)
    con.query(sql2, function (err, result) {
      if (err) throw err;
      console.log(result)
      res.redirect(`/admin/newProjects`)
    })
  })
});

module.exports = router;
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

router.post('/editProject', auth.isLoggedIn, function(req, res, next) {
  if(req.query.model == 'description') {
    var sql = `UPDATE project_details SET description = "${req.body.description}" WHERE id = '${req.query.projectId}'`
    con.query(sql, function(err, rows) {
      if(err) console.log(err);
      console.log(rows.affectedRows + " record(s) updated");
      res.redirect(`/admin/newProject?id=${req.query.projectId}`)
    })
  }else if(req.query.model == 'aim') {
    var sql = `UPDATE project_details SET aimedResult = "${req.body.aimedResult}" WHERE id = '${req.query.projectId}'`
    con.query(sql, function(err, rows) {
      if(err) console.log(err);
      console.log(rows.affectedRows + " record(s) updated");
      res.redirect(`/admin/newProject?id=${req.query.projectId}`)
    })
  }else if(req.query.model == 'impact') {
    var sql = `UPDATE project_details SET descriptionOfImpact = "${req.body.impact}" WHERE id = '${req.query.projectId}'`
    con.query(sql, function(err, rows) {
      if(err) console.log(err);
      console.log(rows.affectedRows + " record(s) updated");
      res.redirect(`/admin/newProject?id=${req.query.projectId}`)
    })
  }else if(req.query.model == 'projectTitle') {
    var sql = `UPDATE project_details SET title = "${req.body.title}", organizationName = "${req.body.org}" WHERE id = '${req.query.projectId}'`
    con.query(sql, function(err, rows) {
      if(err) console.log(err);
      console.log(rows.affectedRows + " record(s) updated");
      res.redirect(`/admin/newProject?id=${req.query.projectId}`)
    })
  }else if(req.query.model == 'projectDates') {
    var sql = `UPDATE project_details SET fundCampaignStartDate = "${req.body.startDate}", fundCampaignEndDate = "${req.body.endDate}" WHERE id = '${req.query.projectId}'`
    con.query(sql, function(err, rows) {
      if(err) console.log(err);
      console.log(rows.affectedRows + " record(s) updated");
      res.redirect(`/admin/newProject?id=${req.query.projectId}`)
    })
  }else if(req.query.model == 'funding') {
    var sql = `UPDATE project_funding SET amountRequired = "${req.body.amount}", currencyId = "${req.body.currency}" WHERE projectId = '${req.query.projectId}'`
    con.query(sql, function(err, rows) {
      if(err) console.log(err);
      console.log(rows.affectedRows + " record(s) updated");
      res.redirect(`/admin/newProject?id=${req.query.projectId}`)
    })
  }else if(req.query.model == 'address') {
    var sql = `UPDATE addresses SET country = "${req.body.country}", region = "${req.body.region}", gpsCordinates = "${req.body.gps}" WHERE id = '${req.query.projectId}'`
    con.query(sql, function(err, rows) {
      if(err) console.log(err);
      console.log(rows.affectedRows + " record(s) updated");
      res.redirect(`/admin/newProject?id=${req.query.projectId}`)
    })
  }else {
    var sql = `UPDATE social_media_links SET link = "${req.body.youtube}" WHERE projectId = '${req.query.projectId}' AND app = 'youTube'`
    var sql2 = `UPDATE social_media_links SET link = "${req.body.facebook}" WHERE projectId = '${req.query.projectId}' AND app = 'facebook'`
    var sql3 = `UPDATE social_media_links SET link = "${req.body.twitter}" WHERE projectId = '${req.query.projectId}' AND app = 'twitter'`
    var sql4 = `UPDATE social_media_links SET link = "${req.body.instagram}" WHERE projectId = '${req.query.projectId}' AND app = 'instagram'`
    con.query(sql, function(err, rows) {
      if(err) console.log(err);
      console.log(rows.affectedRows + " record(s) updated");
      con.query(sql2, function(err, rows) {
        if(err) console.log(err);
        console.log(rows.affectedRows + " record(s) updated");
        con.query(sql3, function(err, rows) {
          if(err) console.log(err);
          console.log(rows.affectedRows + " record(s) updated");
          con.query(sql4, function(err, rows) {
            if(err) console.log(err);
            console.log(rows.affectedRows + " record(s) updated");
            res.redirect(`/admin/newProject?id=${req.query.projectId}`)
          })
        })
      })
      
    })
  }
});

router.post('/assignReviewer', auth.isLoggedIn, function(req, res, next) {
  console.log(req.body)
  const sql = `INSERT INTO project_review (projectId, reviewerId) VALUES (?,?)`;
  const sql2 = `UPDATE project_details SET statusId = '6' WHERE id = '${req.body.projectId}'`;
  const sql3 = `SELECT * FROM users WHERE id = ${req.body.reviewerId}`
  con.query(sql, [req.body.projectId, req.body.reviewerId], function (err, result) {
    if (err) throw err;
    console.log(result)
    con.query(sql2, function (err, result) {
      if (err) throw err;
      console.log(result)
      con.query(sql3, function (err, reviewer) {
        if (err) throw err;
        console.log(reviewer)
        const receipient = reviewer.email;
        const subject =  `New Project`;
        const html = `<div><p>Hi! ${reviewer.name}, A new project has been assigned to you to review. Please open your portal to view</p></div> <div><p>Thank you</p></div>`
        mailer(receipient, subject, html);
        res.redirect(`/admin/newProjects`)
      })
    })
  })
});

router.post('/reviewProject', auth.isLoggedIn, function(req, res, next) {
  var sql = `UPDATE project_details SET statusId = '2' WHERE id = '${req.body.projectId}'`;
  var sql2 = `INSERT INTO project_review (projectId, reviewerId, remark, decision) VALUES (?,?,?,?)`
  // var sql2 = `UPDATE project_review SET remark = "${req.body.remarks}", decision = '${req.body.decision}' WHERE projectId = '${req.body.projectId}'`;
  con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);
      con.query(sql2, [req.body.projectId, req.user.id, req.body.remarks, req.body.decision], function (err, result) {
          if (err) throw err;
          console.log(result);
          const receipient = req.query.email;
          const subject =  `Project Reviewed`;
          const html = `<div><p>Hi! ${req.query.po}, your project title: <b>${req.query.title}</b> has been reviewed</p></div> <div><p>Thank you</p></div>`
          mailer(receipient, subject, html);
          res.redirect('/admin/newProjects');
      });
  });
});

router.get('/reviewedProjects', auth.isLoggedIn, function(req, res, next) {
  var sql = `SELECT project_details.id AS id, project_details.title AS title, project_details.description AS description, project_details.fundCampaignstartDate, project_details.fundCampaignEndDate, project_details.statusId AS projectStatusId, project_funding.amountRequired, project_funding.amountRecieved, project_funding.currencyId, photos.projectId, photos.path FROM project_details JOIN project_funding ON project_details.id = project_funding.projectId JOIN photos on project_funding.projectId = photos.projectId WHERE project_details.statusId = '2' GROUP BY photos.projectId`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
    res.render('reviewedProjects', { 
      user : req.user,
      projects: result 
    })
  });
  
});

router.get('/publishProject', auth.isLoggedIn, function(req, res, next) {
  var sql = `SELECT * FROM project_details WHERE id = '${req.query.id}'`;
  var sql2 = `SELECT * FROM project_funding WHERE projectId = '${req.query.id}'`;
  var sql3 = `SELECT * FROM photos WHERE projectId = '${req.query.id}'`;
  var sql4 = `SELECT * FROM addresses WHERE id = '${req.query.id}'`;
  var sql5 = `SELECT * FROM social_media_links WHERE projectId = '${req.query.id}'`;
  var sql6 = `SELECT users.id AS userId, users.name, users.email, users.phoneNumber, project_details.id FROM users JOIN project_details ON users.id = project_details.projectOwnerId WHERE project_details.id = '${req.query.id}'`;
  var sql7 = `SELECT * FROM project_review WHERE projectId = '${req.query.id}'`;
  var sql8 = `SELECT * FROM bank_account_details WHERE projectId = '${req.query.id}'`;
  var sql9 = `SELECT * FROM mobile_money_details WHERE projectId = '${req.query.id}'`;
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
              con.query(sql7, function (err, review) {
                if (err) throw err;
                console.log(review);
                con.query(`SELECT * FROM users WHERE id = '${review[0].reviewerId}'`, function (err, reviewer) {
                  if (err) throw err;
                  console.log(reviewer);
                  con.query(sql8, function (err, bankPay) {
                    if (err) throw err;
                    console.log(bankPay);
                    con.query(sql9, function (err, mobilePay) {
                      if (err) throw err;
                      console.log(mobilePay);
                      res.render('publishProject', { 
                        user : req.user,
                        projectDetails: projectDetails,
                        projectFunding: projectFunding,
                        photos: photos,
                        address: address,
                        socialMedia: socialMedia,
                        projectOwner: projectOwner,
                        review: review,
                        reviewer: reviewer,
                        mobilePay: mobilePay,
                        bankPay: bankPay
                      });
                    });
                  });
                });
              });
            })
          });
        });
      });
    })
  }); 
});

router.get('/requestPayInfo', auth.isLoggedIn, function(req, res, next) {
  console.log(req.query)
  const receipient = req.query.email;
  const subject =  `Payment Information`;
  const html = `<div><p>Hi! ${req.query.name}, please provide payment information for your project title: <b>${req.query.title}</b>. This will qualify your project to be published</p></div> <div><p>Thank you</p></div>`
  mailer(receipient, subject, html);
    res.redirect(`/admin/publishProject?id=${req.query.id}`)  
});

router.get('/publish', auth.isLoggedIn, function(req, res, next) {
  var sql = `UPDATE project_details SET statusId = '3' WHERE id = '${req.query.projectId}'`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
    const receipient = req.query.email;
    const subject =  `Project Pulished`;
    const html = `<div><p>Hi! ${req.query.po}, your project title: <b>${req.query.title}</b> has been published. Please make sure payment information has been provided</p></div> <div><p>Thank you</p></div>`
    mailer(receipient, subject, html);
    res.redirect(`/admin/reviewedProjects`)
  });
  
});

module.exports = router;
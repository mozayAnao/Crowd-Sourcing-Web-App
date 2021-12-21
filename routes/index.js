var express = require('express');
var router = express.Router();
const auth = require('../modules/authenticate');
const con = require('../modules/dbConnect');

/* GET home page. */
router.get('/', auth.isLoggedOut, function(req, res, next) {
  res.set("Content-Security-Policy", "")
  var sql = `SELECT project_details.id AS id, project_details.title AS title, project_details.description AS description, project_details.fundCampaignstartDate, project_details.fundCampaignEndDate, project_details.statusId AS projectStatusId, project_funding.amountRequired, project_funding.amountRecieved, project_funding.currencyId, photos.projectId, photos.path, addresses.country FROM project_details JOIN addresses on project_details.id = addresses.id JOIN project_funding ON project_details.id = project_funding.projectId JOIN photos on project_funding.projectId = photos.projectId WHERE project_details.statusId = '3' GROUP BY photos.projectId`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
    res.render('index', { 
      message: req.flash('loginMessage'),
      signupmessage: req.query.msg,
      projects: result 
    });
  });
});

router.get('/viewProject', function(req, res, next) {
  var sql = `SELECT * FROM project_details WHERE id = '${req.query.id}'`;
  var sql2 = `SELECT * FROM project_funding WHERE projectId = '${req.query.id}'`;
  var sql3 = `SELECT * FROM photos WHERE projectId = '${req.query.id}'`;
  var sql4 = `SELECT * FROM addresses WHERE id = '${req.query.id}'`;
  var sql5 = `SELECT * FROM social_media_links WHERE projectId = '${req.query.id}'`;
  var sql6 = `SELECT users.id AS userId, users.name, users.email, users.phoneNumber, project_details.id FROM users JOIN project_details ON users.id = project_details.projectOwnerId WHERE project_details.id = '${req.query.id}'`;
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
                res.render('viewProject', { 
                  message: req.flash('loginMessage'),
                  projectDetails: projectDetails,
                  signupmessage: req.query.msg,
                  projectFunding: projectFunding,
                  photos: photos,
                  address: address,
                  socialMedia: socialMedia,
                  projectOwner: projectOwner
                });
            })
          });
        });
      });
    })
  }); 
});

module.exports = router;

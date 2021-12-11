var express = require('express');
var router = express.Router();
const fs = require('fs');
const multer  = require('multer')
const upload = multer({ dest: './public/images/uploads/' })
const con = require('../modules/dbConnect');
const { v4: uuidv4 } = require('uuid');

router.get('/', isLoggedIn, function(req, res, next) {
    res.render('projectOwner', { 
        user : req.user 
      })
});

router.get('/myProjects', isLoggedIn, function(req, res, next) {
  var sql = `SELECT project_details.id AS id, project_details.title AS title, project_details.description AS description, project_details.fundCampaignstartDate, project_details.fundCampaignEndDate, project_details.statusId AS projectStatusId, project_funding.amountRequired, project_funding.amountRecieved, project_funding.currencyId, photos.projectId, photos.path FROM project_details JOIN project_funding ON project_details.id = project_funding.projectId JOIN photos on project_funding.projectId = photos.projectId WHERE project_details.projectOwnerId = '${req.user.id}' GROUP BY photos.projectId`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result);
    res.render('myProjects', { 
      user : req.user,
      projects: result 
    })
  });
  
});

router.get('/myProject', isLoggedIn, function(req, res, next) {
  var sql = `SELECT * FROM project_details WHERE id = '${req.query.id}'`;
  var sql2 = `SELECT * FROM project_funding WHERE projectId = '${req.query.id}'`;
  var sql3 = `SELECT * FROM photos WHERE projectId = '${req.query.id}'`;
  var sql4 = `SELECT * FROM addresses WHERE id = '${req.query.id}'`;
  var sql5 = `SELECT * FROM social_media_links WHERE projectId = '${req.query.id}'`;
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
            res.render('myProject', { 
              user : req.user,
              projectDetails: projectDetails,
              projectFunding: projectFunding,
              photos: photos,
              address: address,
              socialMedia: socialMedia
            });
          });
      });
    });
    
    })
  });
  
});


router.get('/createProject', isLoggedIn, function(req, res, next) {
  console.log(req.user)
  res.render('createProject', { 
      user : req.user 
    })
});

router.post('/editProject', isLoggedIn, function(req, res, next) {
  if(req.query.model == 'description') {
    var sql = `UPDATE project_details SET description = "${req.body.description}" WHERE id = '${req.query.projectId}'`
    con.query(sql, function(err, rows) {
      if(err) console.log(err);
      console.log(rows.affectedRows + " record(s) updated");
      res.redirect(`/projectOwner/myProject?id=${req.query.projectId}`)
    })
  }else if(req.query.model == 'aim') {
    var sql = `UPDATE project_details SET aimedResult = "${req.body.aimedResult}" WHERE id = '${req.query.projectId}'`
    con.query(sql, function(err, rows) {
      if(err) console.log(err);
      console.log(rows.affectedRows + " record(s) updated");
      res.redirect(`/projectOwner/myProject?id=${req.query.projectId}`)
    })
  }else if(req.query.model == 'impact') {
    var sql = `UPDATE project_details SET descriptionOfImpact = "${req.body.impact}" WHERE id = '${req.query.projectId}'`
    con.query(sql, function(err, rows) {
      if(err) console.log(err);
      console.log(rows.affectedRows + " record(s) updated");
      res.redirect(`/projectOwner/myProject?id=${req.query.projectId}`)
    })
  }else if(req.query.model == 'projectTitle') {
    var sql = `UPDATE project_details SET title = "${req.body.title}", organizationName = "${req.body.org}" WHERE id = '${req.query.projectId}'`
    con.query(sql, function(err, rows) {
      if(err) console.log(err);
      console.log(rows.affectedRows + " record(s) updated");
      res.redirect(`/projectOwner/myProject?id=${req.query.projectId}`)
    })
  }else if(req.query.model == 'projectDates') {
    var sql = `UPDATE project_details SET fundCampaignStartDate = "${req.body.startDate}", fundCampaignEndDate = "${req.body.endDate}" WHERE id = '${req.query.projectId}'`
    con.query(sql, function(err, rows) {
      if(err) console.log(err);
      console.log(rows.affectedRows + " record(s) updated");
      res.redirect(`/projectOwner/myProject?id=${req.query.projectId}`)
    })
  }else if(req.query.model == 'funding') {
    var sql = `UPDATE project_funding SET amountRequired = "${req.body.amount}", currencyId = "${req.body.currency}" WHERE projectId = '${req.query.projectId}'`
    con.query(sql, function(err, rows) {
      if(err) console.log(err);
      console.log(rows.affectedRows + " record(s) updated");
      res.redirect(`/projectOwner/myProject?id=${req.query.projectId}`)
    })
  }else if(req.query.model == 'address') {
    var sql = `UPDATE addresses SET country = "${req.body.country}", region = "${req.body.region}", gpsCordinates = "${req.body.gps}" WHERE id = '${req.query.projectId}'`
    con.query(sql, function(err, rows) {
      if(err) console.log(err);
      console.log(rows.affectedRows + " record(s) updated");
      res.redirect(`/projectOwner/myProject?id=${req.query.projectId}`)
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
            res.redirect(`/projectOwner/myProject?id=${req.query.projectId}`)
          })
        })
      })
      
    })
  }
});

router.post('/saveProject', isLoggedIn, upload.array('initialPhotos', 3), function(req, res, next) {
  console.log(req.files)
  console.log(req.body)
  var insertQuery1 = "INSERT INTO project_details (id, title, description, aimedResult, organizationName, descriptionOfImpact, fundCampaignstartDate, fundCampaignEndDate, projectOwnerId, statusId) VALUES (?,?,?,?,?,?,?,?,?,?)";
  var insertQuery2 = "INSERT INTO addresses (id, country, region, gpsCordinates) VALUES (?,?,?,?)";
  var insertQuery3 = "INSERT INTO photos (projectId, path, statusId) VALUES (?,?,?)";
  var insertQuery4 = "INSERT INTO social_media_links (projectId, app, link) VALUES (?,?,?)";
  var insertQuery5 = "INSERT INTO project_funding (projectId, amountRequired, currencyId) VALUES (?,?,?)";
  const projectId = "MN"+uuidv4()
  const photos = req.files;

  photos.forEach((photo) => {
    const newPath = `public/images/uploads/${photo.originalname}`;
    const path = `/images/uploads/${photo.originalname}`;
    fs.rename(photo.path, newPath, (err) => {
      if(err) console.log("error: "+ err);
      con.query(insertQuery3,[projectId, path, "4"], function(err, rows) {
        if(err) console.log(err);
      })
    })
  })
  
    con.query(insertQuery1,[projectId, req.body.title, req.body.projectDescription, req.body.projectGoal, req.body.org, req.body.projectImpact, req.body.startDate, req.body.endDate, req.user.id, "1"],function(err, rows) {
      if (err)
      console.log(err);
      console.log("new project created")
      con.query(insertQuery2,[projectId, req.body.country, req.body.region, req.body.gps], function(err, rows) {
        if(err) console.log(err);                
            con.query(insertQuery4,[projectId, "youTube", req.body.youtubelink], function(err, rows) {
              if(err) console.log(err);
              if(req.body.facebooklink != "") {
                con.query(insertQuery4,[projectId, "facebook", req.body.facebooklink], function(err, rows) {
                  if(err) console.log(err);
                  if(req.body.twitterlink != "") {
                    con.query(insertQuery4,[projectId, "twitter", req.body.twitterlink], function(err, rows) {
                      if(err) console.log(err);
                      if(req.body.instagramlink != "") {
                        con.query(insertQuery4,[projectId, "instagram", req.body.instagramlink], function(err, rows) {
                          if(err) console.log(err);
                          con.query(insertQuery5,[projectId, req.body.amount, req.body.currency], function(err, rows) {
                            if(err) console.log(err);
                            res.redirect('/myProjects')
                          })
                        })
                      }
                    })
                  }
                })
              }
            })       
      })
    });  
});

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) return next();
  res.redirect("/");
}

function isLoggedOut (req, res, next) {
  if(!req.isAuthenticated()) return next();
  res.redirect(req.originalUrl);
}

// // route middleware to make sure
// function isLoggedIn(req, res, next) {

// 	// if user is authenticated in the session, carry on
// 	if (req.isAuthenticated())
// 		return next();

// 	// if they aren't redirect them to the home page
// 	res.redirect('/');
// }

module.exports = router;

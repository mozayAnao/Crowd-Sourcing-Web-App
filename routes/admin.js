var express = require('express');
var router = express.Router();
const passport = require('passport');
const con = require('../modules/dbConnect');

router.get('/', function(req, res, next) {
  res.render('adminLogin', { message: req.flash('loginMessage') });
});

router.get('/dashboard', function(req, res, next) {
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

module.exports = router;
var express = require('express');
var router = express.Router();
const passport = require('passport');
const validate = require('../modules/validate');

router.get('/', function(req, res, next) {
  res.render('login');
});

router.post('/', passport.authenticate('local-login', {
  // successRedirect : '/projectOwner', // redirect to the secure profile section
  failureRedirect : '/', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}),
function(req, res) {
  console.log(req.flash)
  res.redirect(`/projectOwner?id=${req.user.id}`);
});

router.post('/admin', passport.authenticate('local-login', {
  // successRedirect : '/projectOwner', // redirect to the secure profile section
  failureRedirect : '/admin', // redirect back to the signup page if there is an error
  failureFlash : true // allow flash messages
}),
function(req, res) {
  console.log(req.user)
  if(req.user.roleId == '1') {
    res.redirect(`/admin/dashboard?id=${req.user.id}`);
  }else if(req.user.roleId == '2') {
    res.redirect(`/finAdmin?id=${req.user.id}`);
  }else if(req.user.roleId == '3') {
    res.redirect(`/reviewer?id=${req.user.id}`);
  }else {
    res.redirect('/admin')
  }
});

router.get('/auth/twitter',
  passport.authenticate('twitter'));

router.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/accounts/settings');
  });

router.get('/auth/google',
  passport.authenticate('google'),
  function(req, res){
    // The request will be redirected to Google for authentication, so
    // this function will not be called.
  });

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/accounts/settings');
  });

// router.get('/facebook', function(req, res, next) {
//   res.render('login');
// });

router.get('/github', 
  passport.authenticate('github')
);

router.get('/auth', 
  passport.authenticate('github', { failureRedirect: '/loginFailed' }),
  function(req, res) {
    const user = req.user;
    console.log(user)
    if(!req.user.id){
    res.redirect(`/accounts/settings`);
    }else {
    res.redirect('/projectOwner?id=${req.user.id}')
    }
  });


router.get('/email', function(req, res, next) {
  res.render('login');
});

// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	router.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	router.post('/signup', validate, passport.authenticate('local-signup', {
		// successRedirect : '/projectOwner', // redirect to the secure profile section
		failureRedirect : '/', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}),
  function(req, res) {
    console.log(req.user)
    res.redirect(`/projectOwner?id=${req.user.id}`);
  }
  );

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	// router.get('/profile', isLoggedIn, function(req, res) {
	// 	res.render('profile.ejs', {
	// 		user : req.user // get the user out of session and pass to template
	// 	});
	// });


module.exports = router; 

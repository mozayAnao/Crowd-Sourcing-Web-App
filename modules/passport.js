const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const bcrypt = require('bcrypt-nodejs');
const { v4: uuidv4 } = require('uuid');
const con = require('../modules/dbConnect');
const passportConfig = require('../config');
const GoogleStrategy = require('passport-google').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;

       

module.exports = function(passport) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user);
        console.log(user.id)
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
        // console.log(id)
        // con.query(`SELECT * FROM login_table WHERE id =? `, [id], function(err, rows){
        //     console.log("first: "+rows[0])
        //     if(!rows.length){
        //         con.query(`SELECT * FROM users WHERE id =?`,[id], function(err, rows) {
        //             // console.log(rows[0])
        //             done(err, rows[0]);
        //         });
        //     }else{
                done(null, user);
            // }s
            
        });
        
   

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            
            con.query("SELECT * FROM login_table WHERE username = ?",[email], function(err, rows) {
                if (err)
                    console.log(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'This email is already taken.'));
                } else {
                    // if there is no user with that username
                    // create the user
                    var newUserMysql = {
                        userId: "PO"+uuidv4(),
                        username: req.body.name,
                        email: email,
                        phone: req.body.phoneCode,
                        password: bcrypt.hashSync(password, null, null),  // use the generateHash function in our user model
                        roleId: "4"
                    };

                    // const userId = uuidv4()

                    var insertQuery = "INSERT INTO login_table (userId, username, password) VALUES (?,?,?)";
                    var insertQuery2 = "INSERT INTO users (id, name, email, phoneNumber, roleId) VALUES (?,?,?,?,?)";
                   
                    con.query(insertQuery2,[newUserMysql.userId, newUserMysql.username, newUserMysql.email, newUserMysql.phone, newUserMysql.roleId],function(err, rows) {
                        if (err)
                        console.log(err);
                        console.log("new user added")

                        
                    });
                  
                   
                    con.query(insertQuery,[newUserMysql.userId, newUserMysql.email, newUserMysql.password],function(err, rows) {
                        if (err)
                        return done(err);
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                    
                    
                    
                }
            });
            
        })
    );

    // =======================Passport-Twitter=======================
    passport.use(new TwitterStrategy({
        consumerKey: 'bzOBlFL8gKuWk7a8xDr2Ja9KV',
        consumerSecret: 'JaYuZPDD2tjX7tXGr1gYmAZxhwMELBO1Bx3NxdtQiMZ9drO1Wn',
        callbackURL: "http://127.0.0.1:5000/auth/twitter/callback"
      },
      function(token, tokenSecret, profile, cb) {
        // User.findOrCreate({ twitterId: profile.id }, function (err, user) {
          return cb(null, profile);
        // });
      }
    ));

// =====================Passport-Google=========================
    passport.use(new GoogleStrategy({
        returnURL: 'http://localhost:5000/auth/google/return',
        realm: 'http://localhost:5000/'
      },
      function(identifier, done) {
            console.log(identifier)
          return done(null, identifier);
       
      }
    ));

       // ===================Passport-gitHub config======================
passport.use(new GitHubStrategy(passportConfig,
    function(accessToken, refreshToken, profile, done) {
        console.log(profile)
        // return cb(null, profile);
        
        con.query("SELECT * FROM users WHERE apiUserId = ?",[profile.id], function(err, rows) {
          if (err)
              console.log(err);
              console.log(rows)
              if(rows.length) {
                rows[0].photo = profile.photos[0].value;
                rows[0].provider = profile.provider;
                rows[0].username = profile.displayName;
                rows[0].apiUserId = profile.id;
                console.log(rows[0])
              return done(null, rows[0]);
              }else {
                  const user = {
                    photo: profile.photos[0].value,
                    provider: profile.provider,
                    username: profile.displayName,
                    apiUserId: profile.id
                  }

                  rows.push(user);

                  return done(null, rows[0]);
              }
          
      });
    
    }
    ));
  
    // passport.serializeUser((user, cb) => {
    //     cb(null, user.id);
    // })
  
    // passport.deserializeUser((id, cb) => {
    //   con.query("SELECT * FROM user WHERE apiUserId = ?",[profile.id], function(err, rows) {
    //     if (err)
    //         console.log(err);
    //     if (rows.length) {
    //         return cb(null, rows[0]);}
    //     });
    //     // cb(null, user);
    // })

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            
            con.query("SELECT * FROM login_table WHERE username = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                bcrypt.compare(password, rows[0].password, function(err, res) {
                    if(err) return done(err);
        
                    if(res === false) {
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
                    }
                    con.query("SELECT * FROM users WHERE id = ?", [rows[0].userId], function(err, rows2) {
                        if(err) return done(err);
                        rows2[0].username = rows2[0].name;
                        return done(null, rows2[0])
                    })
                })
                // if (!bcrypt.compare(password, rows[0].password))
                //     return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // // all is well, return successful user
                // return done(null, rows[0]);
            });
            
        })
    );
};


/**
 * Created by Ben on 8/24/2015.
 */
var Room            = require('../app/models/room');



module.exports = function(app, passport){
    app.get('/', function(req, res){
       res.render('index.ejs');         //loads ejs file
    });

    app.get('/login', function(req,res){
       res.render('login.ejs',  { message: req.flash('loginMessage') });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/characters', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/login', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));



    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });
    app.get('/characters', isLoggedIn, function(req, res) {
        res.render('characters.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

  //=====================info requests======================

    app.get('/user_data', function(req, res) {
        console.log('attempting Room Change');
        if (req.user === undefined) {
            console.log('failed');
            // The user is not logged in
            res.json({});
        } else {
            console.log(req.user.local.email + " requesting user data");
            res.json({
                username: req.user
            });
        }
    });
};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}



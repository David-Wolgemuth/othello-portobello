// config/passport.js

var FacebookStrategy = require('passport-facebook').Strategy;
var mongoose = require("mongoose");
var User = mongoose.model("User");
var passport = require("passport");


module.exports = function() {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    
    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(
        new BearerStrategy(
            function (token, done) {
                console.log(token);
                User.findOne({ accessToken: token },
                    function (err, user) {
                        if (err) {
                            return done(err);
                        }
                        if (!user) {
                            return done(null, false);
                        }
                        return done(null, user, { scope: "all" });
                    });
            }
        )
    );

    passport.use(
        new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields   : ["id", "displayName"]
    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                console.log("Facebook Auth");
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    user.accessToken = token;
                    user.save(function (err, doc) {
                        return done(err, user); // user found, return that user
                    });
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser            = new User();

                    // set all of the facebook information in our user model
                    newUser.facebookId    = profile.id; // set the users facebook id                   
                    // newUser.accessToken = token; // we will save the token that facebook provides to the user                    
                    newUser.name  = profile.displayName;

                    // save our user to the database
                    newUser.save(function(err) {
                        if (err) {
                            throw err;
                        }
                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }
            });
        });
    }));
};
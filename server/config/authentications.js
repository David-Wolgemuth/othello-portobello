var FacebookStrategy = require('passport-facebook').Strategy;
var mongoose = require("mongoose");
var User = mongoose.model("User");
var passport = require("passport");
var jwt = require("jsonwebtoken");
var keys = require("./keys.js");

function authenticateJWT(req, res, next) 
{
    /*
        Authenticates JSON Web Tokens
    */
    var token = req.headers["x-auth-token"];
    if (token) {
        if (token == keys.jwt.testToken) {
            req.userId = "testerID";
            return next();
        }
        jwt.verify(token, keys.jwt.secret, function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    message: err
                });
            } else {
                req.userId = decoded.id;
                return next();
            }
        });
    } else {
        return res.status(403).json({
            message: "No Token Provided."
        });
    }
}
function issueJWT (req, res) 
{
    console.log("Issuing JWT to:", req.user);
    if (req.user) {
        var data = {
            id: req.user.id
        };
        var options = {
            expiresIn: 60 * 60 * 24 * 1  // 1 Day
        };
        var token = jwt.sign(data, keys.jwt.secret, options);
        res.json({
            user: req.user,
            issuedToken: token
        });
    }  
}
function unauthorizedError (err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        res.status(401).json({ message: "Invalid Token" });
    }
}
function facebookLogin(token, refreshToken, profile, done)
{
    process.nextTick(function () {
        User.findOne({ "facebookId" : profile.id }, function(err, user) {
            if (err) { return done(err); }
            if (user) {
                // Existing User
                console.log("Facebook Login:", user.name);
                return done(null, user);
            } else {
                // Save First Time User
                user = new User({
                    facebookId:  profile.id,
                    name: profile.displayName,
                });
                user.save(function (err) {
                    if (err) { throw err; }
                    return done(null, user);
                });
            }
        });
    });
}
var facebookOptions = {
    clientID        : keys.facebook.clientID,
    clientSecret    : keys.facebook.clientSecret,
    callbackURL     : "http://localhost:5000/auth/facebook/callback",
    profileFields   : ["id", "displayName"]
};
var facebookStrategy = new FacebookStrategy(facebookOptions, facebookLogin);
passport.use(facebookStrategy);

module.exports = (function () 
{
    var Authentication = {};
    Authentication.fb = {
        login: passport.authenticate("facebook", {
            session: false, scope: [] 
        }),
        callback: passport.authenticate("facebook", { 
            session: false, 
        }),
    };
    Authentication.jwt = {
        authenticate: authenticateJWT,
        issue: issueJWT
    };
    Authentication.err = {
        unauthorized: unauthorizedError,
    };
    return Authentication;
}) ();

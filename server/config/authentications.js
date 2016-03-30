var mongoose = require("mongoose");
var User = mongoose.model("User");
var request = require("request");
var keys = require("./keys");

module.exports = (function () 
{
    var Authentication = {};
    Authentication.facebook = function (req, res, next)
    {
        if (!req.headers["x-auth-token"]) {
            return res.status(403).json({
                message: "User Not Logged In.  (x-auth-token required)"
            });
        } else {
            var baseUrl = "https://graph.facebook.com/me";
            var params = { "fields" : "id", "access_token": req.headers["x-auth-token"] };
            var url = { url: baseUrl, qs: params, json: true };
            request(url, function (err, response, body) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: err });
                } else if (body.error || !body.id) {
                    console.log("Could not authenticate", body.error);
                    return res.status(401).json({ "message": body.error });
                } else {
                    req.facebookId = body.id;
                    next();
                }
            });
        }
    };
    return Authentication;
}) ();

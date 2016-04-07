var mongoose = require("mongoose");
var User = mongoose.model("User");
var request = require("request");
var keys = require("./keys");

function AuthenticationConstructor() 
{
    var self = this;
    self.fb = {};

    
    self.fb.http = function (req, res, next)
    {
        if (!req.headers["x-auth-token"]) {
            return res.status(403).json({
                message: "User Not Logged In.  (x-auth-token required)"
            });
        }
        facebookAuth(req.headers["x-auth-token"], function (err, user) {
            if (err) {
                return res.status(err.code).json({ message: err.message });
            }
            req.user = user;
            next();
        });
    };
    self.fb.sockets = function (socket, callback)
    /*
        callback(err, user)
    */
    {
        var handshake = socket.handshake;
        var headers = handshake.headers;
        var token = headers["x-auth-token"];
        if (!token) {
            return callback({ code: 403, message: "No Token"});
        }
        facebookAuth(token, callback);
    };
    function facebookAuth(token, callback)
    /*
        callback(err, user)
    */
    {
        var baseUrl = "https://graph.facebook.com/me";
        var params = { "fields" : "id", "access_token": token };
        var url = { url: baseUrl, qs: params, json: true };
        request(url, function (err, response, body) {
            if (err) {
                return callback({ code: 500, message: err });
            } else if (body.error || !body.id) {
                return callback({ code: 401, message: body.error });
            } else {
                User.findByFBID(body.id, function (err, user) {
                    if (err) {
                        var message = "Unknown Error Authenticating User";
                        return callback({ code: 500, message: message });
                    }
                    if (user) {
                        callback(null, user);
                    } else {
                        callback(null, { fbid: body.id });
                    }
                });
            }
        });
    }
}

module.exports = new AuthenticationConstructor();

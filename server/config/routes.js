var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");
var secret = require("./auth.js").secret;


module.exports = function (app, passport)
{
    app.use(function (err, req, res, next) {
        if (err.name === "UnauthorizedError") {
            res.json({ error: 401, message: "Invalid Token" });
        }
    });
    app.get("/auth/facebook",
        passport.authenticate("facebook", {
            session: false, scope: []
        }));
    app.get("/auth/facebook/callback",
        passport.authenticate("facebook", { session: false, failureRedirect: "/" }),
        function (req, res) {
            if (req.user) {
                var data = {
                    id: req.user.id
                };
                var options = {
                    expiresInMinutes: 120
                };
                var token = jwt.sign(data, secret, options);
                res.json({
                    user: req.user,
                    token: token
                });
            }
        }
    );
    app.get("/logout", function (req, res) {
        req.logout();
        res.redirect("/");
    });
    app.get("/", authenticateJWT, function (req, res) {
        res.json({ message: "Success", decoded: req.decoded });
    });
    
};
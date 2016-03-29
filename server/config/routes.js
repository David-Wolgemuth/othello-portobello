var auth = require("./authentications.js");

module.exports = function (app)
{
    app.use(auth.err.unauthorized);
    var cors = require("cors");
    app.use(cors());
    app.get("/auth/facebook", auth.fb.login);
    app.get("/auth/facebook/callback", auth.fb.callback, auth.jwt.issue);
    app.get("/logout", function (req, res) {
        req.logout();
        res.redirect("/");
    });
    app.get("/api", auth.jwt.authenticate, function (req, res) {
        console.log("Hit");
        res.json({ message: "Success", userId: req.userId });
    });
};
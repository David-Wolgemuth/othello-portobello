var auth = require("./authentications.js");

module.exports = function (app)
{
    app.use(auth.err.unauthorized);

    app.get("/auth/facebook", auth.fb.login);
    app.get("/auth/facebook/callback", auth.fb.callback, auth.jwt.issue);
    app.get("/logout", function (req, res) {
        req.logout();
        res.redirect("/");
    });

    app.get("/", auth.jwt.authenticate, function (req, res) {
        res.json({ message: "Success", userId: req.userId });
    });
    
};
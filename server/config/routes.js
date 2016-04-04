/******
    Routes for Othello Api
*/
var auth = require("./authentications.js");
var users = require("../controllers/users.js");
var matches = require("../controllers/matches.js");

module.exports = function (app)
{
    app.post("/login", auth.facebook, users.create);
    /*
        + { name: facebook_name }
    */
    app.get("/users/:id", auth.facebook, users.show);
    /*
        -> userdata: { facebookId: "", name: "" }
        + ?history="userId"
        -> history: { totals: { wins: Number, losses: Number }, versus: ... }
    */
    app.get("/users", auth.facebook, users.index);
    /*
        -> users: [{ facebookId: "", name: "" }]
    */
    app.get("/matches/current", auth.facebook, matches.current);
    /*
        + { opponentFacebookId: "" }
        -> { match: Match }
    */
    app.post("/matches", auth.facebook, matches.create);
    /*
        + { opponentFacebookId: "" }
        -> { match: Match }
    */
    app.delete("/matches/:id", auth.facebook, matches.forfeit);
    /*
        -> { success: Boolean }
    */
    app.get("*", function (req, res) {
        var url = req.protocol + '://' + req.get('host') + req.originalUrl;
        res.status(404).json({ message: "`" + url + "`" + " Not Valid Path." }); 
    });
};
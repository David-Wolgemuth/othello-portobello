/******
    Routes for Othello Api
*/
var auth = require("./authentications.js");
var users = require("../controllers/users.js");
var matches = require("../controllers/matches.js");

module.exports = function (app)
{
    app.get("/users/me", auth.facebook, users.show);
    /*
        -> userdata: { facebookId: "", name: "" }
        + ?history="userId"
        -> history: { totals: { wins: Number, losses: Number }, versus: ... }
    */
    app.get("/users", auth.facebook, users.index);
    /*
        -> users: [{ facebookId: "", name: "" }]
    */
    app.get("/matches", auth.facebook, matches.current);
    /*
        + ?opponentFBID=""
        + ?current=true
        -> { match: Match }
    */
    app.post("/users/create", auth.facebook, users.create);
    /*
        + { name: facebook_name }
    */
    app.post("/matches", auth.facebook, matches.create);
    /*
        + { opponentFBID: "" }
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
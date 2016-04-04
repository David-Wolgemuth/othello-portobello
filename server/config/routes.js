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
        + ?stats=opponentId / ?stats=me
        -> stats: { wins: 12, losses: 12 }, versus: { wins: 2, losses: 2 }
    */
    app.get("/users", auth.facebook, users.index);
    /*
        -> users: [{ facebookId: "", name: "" }]
    */
    app.get("/matches", auth.facebook, matches.current);
    /*
        + ?opponentId=""
        + ?current=true
        -> { match: Match }
    */
    app.post("/users/create", auth.facebook, users.create);
    /*
        + { name: facebook_name }
    */
    app.post("/matches", auth.facebook, matches.create);
    /*
        + { opponentId: "" }
        -> { match: Match }
    */
    app.delete("/matches/:id", auth.facebook, matches.forfeit);
    /*
        -> { success: Boolean }
    */
    app.get("*", function (req, res) {
        var url = req.protocol + '://' + req.get('host') + req.originalUrl;
        res.status(404).json({ message: "GET `" + url + "`" + " Not Valid Path." }); 
    });
    app.post("*", function (req, res) {
        var url = req.protocol + '://' + req.get('host') + req.originalUrl;
        res.status(404).json({ message: "POST `" + url + "`" + " Not Valid Path." }); 
    });
};
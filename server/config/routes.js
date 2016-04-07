/******
    Routes for Othello Api
*/

var authenticate = require("./authentications.js").fb.http;
var users = require("../controllers/users.js");
var matches = require("../controllers/matches.js");

module.exports = function (app)
{
    app.get("/users/me", authenticate, users.show);
    /*
        -> user: { fbid: "", name: "" }
        + ?stats=opponentId / ?stats=me
        -> stats: { total: { wins: 12, losses: 12 }, versus: { wins: 2, losses: 2 } }
    */
    app.get("/users", authenticate, users.index);
    /*
        -> users: [{ facebookId: "", name: "" }]
    */
    app.get("/matches", authenticate, matches.index);
    /*
        + ?opponentId=""
        + ?current=true
        -> { match: Match }
    */
    app.get("/matches/:id", authenticate, matches.show);
    
    app.post("/users", authenticate, users.create);
    /*
        + { name: facebook_name }
    */
    app.post("/matches", authenticate, matches.create);
    /*
        + { opponentId: "" }
        -> { match: Match }
    */
    app.put("/matches/:id", authenticate, matches.update);
    /*
        + { move: { "x": 2, "y": 4, "player": 1, "flipped": 2 } }
            (json move object retrieved from "getValidMoves")
        -> { match: Match }
    */
    app.delete("/matches/:id", authenticate, matches.forfeit);
    /*
        -> { success: Boolean }
    */
    app.get("/html", function (req, res) {
        var keys = require("./keys.js");
        res.render("index", { appId: keys.facebook.clientID });
    });
    app.get("/", function (req, res) {
        console.log("Why");
        var url = req.protocol + '://' + req.get('host') + req.originalUrl;
        res.status(404).json({ message: "GET `" + url + "`" + " Not Valid Path." }); 
    });
    app.post("/", function (req, res) {
        var url = req.protocol + '://' + req.get('host') + req.originalUrl;
        res.status(404).json({ message: "POST `" + url + "`" + " Not Valid Path." }); 
    });
};
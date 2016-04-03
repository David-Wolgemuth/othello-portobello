var auth = require("./authentications.js");
var users = require("../controllers/users.js");
var matches = require("../controllers/matches.js");

module.exports = function (app)
{
    app.post("/login", auth.facebook, users.create);
    /*
        + x-auth-token: facebook_token
        + body.name: facebook_name
        -> message: "Status Of Login"
    */
    app.get("/users/:id", auth.facebook, users.show);
    /*
        + x-auth-token: facebook_token
        -> userdata: { facebookId: "", name: "" }
        + ?history="userId"
        -> history: { totals: { wins: Number, losses: Number }, versus: ... }
    */
    app.get("/users", auth.facebook, users.index);
    /*
        + x-auth-token: facebook_token
        -> users: [{ facebookId: "", name: "" }]
    */
    app.post("/matches", auth.facebook, matches.create);
};
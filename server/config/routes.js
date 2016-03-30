var auth = require("./authentications.js");
var users = require("../controllers/users.js");

module.exports = function (app)
{
    app.post("/login", auth.facebook, users.create);
    /*
        + x-auth-token: facebook_token
        + body.name: facebook_name
        
        -> message: "Status Of Login"
    */
    app.get("/users/:id", auth.facebook, users.show);
};
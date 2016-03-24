/*
    Othello API
    Main Server Config File
*/

var express     = require("express");
var bodyParser  = require("body-parser");
var path        = require("path");
var expressJwt  = require("express-jwt");
var jwt         = require("jsonwebtoken");

var app = express();
var secret = require("./server/config/auth.js").secret;

app.use("/api", expressJwt({ secret: secret }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require("./server/config/db.js");
require("./server/config/routes.js")(app);

app.listen(5000, function () {
    console.log("Running on 5000");
});

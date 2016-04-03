/*
    Othello API
    Main Server Config File
*/

var express     = require("express");
var bodyParser  = require("body-parser");
var path        = require("path");

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require("./server/config/db.js");
require("./server/config/routes.js")(app);

var port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log("Running on Port:", port);
});

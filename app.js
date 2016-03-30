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

app.use(express.static(path.join(__dirname, "client")));

require("./server/config/db.js");
require("./server/config/routes.js")(app);

app.listen(5000, function () {
    console.log("Running on 5000");
});

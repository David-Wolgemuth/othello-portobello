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

app.use(express.static(path.join(__dirname, "server/static")));
app.use(express.static(path.join(__dirname, "bower_components")));

var port = process.env.PORT || 5000;
var server = app.listen(port, function () {
    console.log("Running on Port:", port);
});

require("./server/config/db.js");

var subpub = require("./server/config/sub-pub.js");
subpub.init(server);

require("./server/config/routes.js")(app);

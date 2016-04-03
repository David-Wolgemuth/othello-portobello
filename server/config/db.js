// Mongoose Configuration

var mongoose = require("mongoose");
var keys = require("./keys.js");
mongoose.connect("mongodb://" + keys.mongolab.user + ":" + keys.mongolab.password + "@ds015770.mlab.com:15770/othello");

// Require All Files In Models Directory
var fs = require("fs");
var models_path = __dirname + "/../models";
fs.readdirSync(models_path).forEach(function (file) {
    if (file.indexOf(".js") > 0) {
        require(models_path + "/" + file);
    }
});

module.exports = (function () 
{
    return mongoose.connection;
}) ();

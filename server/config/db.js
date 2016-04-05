/******
    Mongoose Configuration
*/

var mongoose = require("mongoose");
var keys = require("./keys.js");
mongoose.connect("mongodb://" + keys.mongolab.user + ":" + keys.mongolab.password + "@ds015770.mlab.com:15770/othello");

// Require All Files In Models Directory
var models_path = __dirname + "/../models";
require(models_path + "/user.js");
require(models_path + "/match.js");

module.exports = (function () 
{
    return mongoose.connection;
}) ();

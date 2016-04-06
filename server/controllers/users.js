
var mongoose = require("mongoose");
var User = mongoose.model("User");

function reportUnknownError (err, res) {
    console.log(err);
    res.status(500).json({ message: err });
}

function UsersConstructor () {
    var self = this;
    self.index = function (req, res)
    {
        User.find({}, "fbid name", function (err, users) {
            if (err) { return reportUnknownError(err, res); }
            res.json({ message: "All Users", users: users });
        });
    };
    self.stats = function (req, res)
    {
        var opponent = req.query.stats;
        if (opponent == "me") {
            User.winsLosses(req.user._id, function (err, stats) {
                if (err) { return reportUnknownError(err, res); }
                res.json({ message: "User Stats", stats: stats });
            });
        } else {
            User.winsLosses(opponent, function (err, stats) {
                if (err) { return reportUnknownError(err, res); }
                User.winsLossesAgainstPlayer(req.user._id, opponent, function (err, versus) {
                    if (err) { return reportUnknownError(err, res); }
                    res.json({ message: "Stats Against Opponent \"" + opponent + "\"", stats: stats, versus: versus });
                });
            });
        }
    };
    self.show = function (req, res) 
    {
        if (req.query.stats) {
            return self.stats(req, res);
        }
        User.findById(req.user._id, "name fbid", function (err, user) {
            if (err) { return reportUnknownError(err, res); }
            if (!user) {
                return res.status(404).json({ message: "User Not Found In Database (Create User if First Time Logged In)" });
            }
            return res.json({ message: "User Found", user: user });
        });
    };
    self.create = function (req, res)
    {
        if (!req.user.fbid || !req.body.name) {
            return res.status(400).json({ message: "Error Creating User.  Must include token in header, name in body." });
        }
        if (req.user._id) {
            return res.status(400).json({ message: "User Already Exists."});
        }
        var user = new User({
            fbid: req.user.fbid,
            name: req.body.name
        });
        user.save(function (err) {
            if (err) { return reportUnknownError(err, res); }
            res.json({ message: "Successfully Created User", user: user });
        });
    };
}

module.exports = new UsersConstructor();

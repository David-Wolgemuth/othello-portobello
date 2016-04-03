
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
        User.find({}, "facebookId name", function (err, users) {
            if (err) { reportUnknownError(err, res); }
            return res.json({ message: "All Users", users: users });
        });
    };
    self.history = function (req, res)
    {
        var user;
        var history = {
            totals: {
                wins: 0,
                losses: 0
            }
        };
        if (req.query.history == "totals") {
            user = null;
        } else if (req.query.history != req.facebookId) {
            return res.status(401).json({ message: "Unauthorized Access" });
        } else {
            history.versus = {
                wins: 0,
                losses: 0
            };
        }
        User.findByFBID(req.facebookId, function (err, opponent) {
            if (err) { reportUnknownError(err, res); }
            if (!opponent) {
                return res.status(404).json({ message: "Opponent Not Found"});
            }
            opponent.matches.forEach(function (match) {
                if (!match.winner) {
                    return;
                } if (match.winner == opponent.facebookId) {
                    history.totals.wins++;
                    if (match.players.indexOf(user) >= 0) {
                        history.versus.wins++;
                    }
                } else {
                    history.totals.losses++;
                    if (match.players.indexOf(user) >= 0) {
                        history.versus.losses++;
                    }
                }
            });
        });
    };
    self.show = function (req, res) 
    {
        if (req.query.history) {
            return Users.history(req, res);
        }
        if (req.facebookId != req.params.id) {
            return res.status(401).json({ message: "Unauthorized Access" });
        }
        User.findByFBID(req.facebookId, "name facebookId", function (err, user) {
            if (err) { reportUnknownError(err, res); }
            return res.json({ message: "User Data", userdata: user });
        });
    };
    self.create = function (req, res)
    {
        if (!req.facebookId || !req.body.name || req.facebookId != req.body.id) {
            return res.status(400).json({ message: "Error Logging In/Creating User.  Must include token in header, name and facebookId in body." });
        }
        User.findOneAndUpdate(
            { facebookId: req.body.id },
            { name: req.body.name },
            { upsert: true },
            function (err, user)
            {
                if (err) {
                    reportUnknownError(err, res);
                } else if (!user) {
                    return res.json({ message: "User Created" });
                } else {
                    return res.json({ message: "\"" + user.name + "\" Succesfully Logged In" });
                }
            }
        );
    };
}
module.exports = new UsersConstructor();

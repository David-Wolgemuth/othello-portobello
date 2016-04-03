
var mongoose = require("mongoose");
var Match = mongoose.model("Match");
var User = mongoose.model("User");

function reportUnknownError (err, res) {
    console.log(err);
    res.status(500).json({ message: err });
}

function MatchesConstructor ()
{
    var self = this;
    self.current = function (req, res)
    {
        Match.findCurrentContainingPlayers(req.facebookId, req.body.opponentFacebookId, function (err, match) {
            if (err) { return reportUnknownError(err, res); }
            res.json({ message: "Current Match", match: match });
        });
    };
    self.create = function (req, res)
    {
        User.findTwoUsersByFBID(req.facebookId, req.body.opponentFacebookId, function (user, opponent) {
            if (!user || !opponent) {
                return res.status(404).json({ message: "Users not found with supplied facebookID." });
            }
            Match.findCurrentContainingPlayers(user._id, opponent._id, function (err, existing) {
                if (err) { return reportUnknownError(err, res); }
                if (existing) {
                    console.log("\n1\n");
                    return res.json({ message: "Found existing match, new match not created", match: match });
                }
                console.log("\n2\n");
                var match = new Match({
                    players: [user._id, opponent._id]
                });
                match.save(function (err) {
                    console.log("\n3\n");
                    if (err) { return reportUnknownError(err, res); }
                    console.log("\n4\n");
                    return res.json({ message: "Successfully created match", match: match });
                });
            });
        });
    };
}

module.exports = new MatchesConstructor();

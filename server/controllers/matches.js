
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
    self.index = function (req, res)
    {
        if (req.query.opponentId) {
            if (req.query.current == "true") {
                return self.current(req, res);
            }
            return self.againstOpponent(req, res);
        }
        User.findById(req.user._id, function (err, user) {
            if (err) { return reportUnknownError(err, res); }
            res.json({ message: "All Matches", matches: matches});
        });   
    };
    self.againstOpponent = function (req, res)
    {
        var user = req.user._id, opp = req.body.opponentId;
        Match.findAllContainingPlayers(user, opp, function (err, matches) {
            if (err) { return reportUnknownError(err, res); }
            res.json({ message: "All Matches Against User \"" + opp + "\"", matches: matches });
        });
    };
    self.current = function (req, res)
    {
        var user = req.user._id, opp = req.body.opponentId;
        Match.findCurrentContainingPlayers(user, opp, function (err, match) {
            if (err) { return reportUnknownError(err, res); }
            res.json({ message: "Current Match Against User \"" + opp + "\"", match: match });
        });
    };
    self.create = function (req, res)
    {
        Match.findCurrentContainingPlayersID(req.user._id, req.body.opponentId, function (err, existing) {
            if (err) { return reportUnknownError(err, res); }
            if (existing) {
                return res.json({ message: "Found Existing Match, New Match Not Created.", match: match });
            }
            var match = new Match({
                players: [user._id, opponent._id]
            });
            match.save(function (err) {
                if (err) { return reportUnknownError(err, res); }
                return res.json({ message: "Successfully Created Match", match: match });
            });
        });
    };
    self.forfeit = function (req, res)
    {
        Match.forfeitMatch(req.params.id, req.user._id, function (err) {
            if (err) { reportUnknownError(err, res); }
            return res.json({ success: true, message: "Successfully Forfeited Match"});
        });
    };
}

module.exports = new MatchesConstructor();

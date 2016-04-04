
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
        if (req.query.opponentFBID) {
            if (req.query.current == "true") {
                return self.current(req, res);
            }
            return self.againstOpponent(req, res);
        }
        User.findByFBID(req.facebookId, function (err, user) {
            if (err) { return reportUnknownError(err, res); }
            res.json({ message: "All Matches", matches: matches});
        });   
    };
    self.againstOpponent = function (req, res)
    {
        var user = req.facebookId, opp = req.body.opponentFacebookId;
        Match.findAllContainingPlayers(user, opp, function (err, matches) {
            if (err) { return reportUnknownError(err, res); }
            res.json({ message: "All Matches Against User With FBID \"" + opp + "\"", matches: matches });
        });
    };
    self.current = function (req, res)
    {
        var user = req.facebookId, opp = req.body.opponentFacebookId;
        Match.findCurrentContainingPlayers(user, opp, function (err, match) {
            if (err) { return reportUnknownError(err, res); }
            res.json({ message: "Current Match Against User With FBID \"" + opp + "\"", match: match });
        });
    };
    self.create = function (req, res)
    {
        Match.findCurrentContainingPlayersFBID(req.facebookId, req.body.opponentFacebookId, function (err, existing) {
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
        Match.forfeitMatchWithFBID(req.params.id, req.facebookId, function (err) {
            if (err) { reportUnknownError(err, res); }
            return res.json({ success: true, message: "Successfully Forfeited Match"});
        });
    };
}

module.exports = new MatchesConstructor();

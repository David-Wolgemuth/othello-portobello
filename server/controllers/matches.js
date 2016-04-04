
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
            res.json({ message: "Found Current Match", match: match });
        });
    };
    self.create = function (req, res)
    {
        Match.findCurrentContainingPlayersFBID(req.facebookId, req.body.opponentFacebookId, function (err, existing) {
            if (err) { return reportUnknownError(err, res); }
            if (existing) {
                return res.json({ message: "Found existing match, new match not created.", match: match });
            }
            var match = new Match({
                players: [user._id, opponent._id]
            });
            match.save(function (err) {
                if (err) { return reportUnknownError(err, res); }
                return res.json({ message: "Successfully created match", match: match });
            });
        });
    };
    self.forfeit = function (req, res)
    {
        Match.forfeitMatchWithFBID(req.params.id, req.facebookId, function (err) {
            if (err) { return res.status(500).json({ success: false, message: err }); }
            return res.json({ success: true, message: "Successfully Forfeited Match"});
        });
    };
}

module.exports = new MatchesConstructor();


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
        Match.findAllContainingPlayer(req.user._id, function (err, matches) {
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
        if (!req.body.opponentId) {
            return res.status(400).json({ message: "Must Contain `opponentId` in Request Body" });
        }
        Match.findCurrentContainingPlayers(req.user._id, req.body.opponentId, function (err, existing) {
            if (err) { return reportUnknownError(err, res); }
            if (existing) {
                return res.json({ message: "Found Existing Match, New Match Not Created.", match: existing });
            }
            var match;
            if (req.body.opponentId == "easy_ai" || req.body.opponentId == "normal_ai") {
                console.log("HERE");
                match = new Match({
                    players : [req.user._id],
                    ai : req.body.opponentId,
                });
            } else {
                console.log("THERE");
                match = new Match({
                    players: [req.user._id, req.body.opponentId]
                });
            }
            match.save(function (err) {
                if (err) { return reportUnknownError(err, res); }
                User.pushNewMatchToUsers(match.players[0], match.players[1], match._id, function (err) {
                    if (err) { return reportUnknownError(err, res); }
                    res.json({ message: "Successfully Created Match", match: match });
                });
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


var mongoose = require("mongoose");
var Match = mongoose.model("Match");
var User = mongoose.model("User");
var subpub = require("../config/sub-pub.js");

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
        if (req.query.unplayed) {
            return self.unplayed(req, res);
        }
        Match.findAllContainingPlayer(req.user._id, function (err, matches) {
            if (err) { return reportUnknownError(err, res); }
            res.json({ message: "All Matches", matches: matches});
        });
    };
    self.show = function (req, res)
    {
        var matchId = req.params.id;
        Match.findById(matchId).lean().exec(function (err, match) {
            if (err) { return reportUnknownError(err, res); }
            if (!match) { return res.status(404).json({ message: "No Matches With Id `" + matchId + "`" }); }
            if (match.players[0].toString() != req.user._id && match.players[1].toString() != req.user._id) {
                return res.status(401).json({ message: "Permission Denied.  (Is logged-in user a part of this match?)" });
            }
            if (req.query.showValidMoves) {
                Match.getValidMoves(matchId, function (err, validMoves) {
                    if (err) { return reportUnknownError(err, res); }
                    match.validMoves = validMoves;
                    res.json({ message: "Found Match, All Valid Moves Shown", match: match });
                });
            } else {
                res.json({ message: "Found Match", match: match });
            }
        });
    };
    self.unplayed = function (req, res) {
        Match.findAllWherePlayersTurn(req.user._id, function(err, matches) {
            if (err) { return reportUnknownError(err, res); }
            res.json({ message: "All Matches Where Player's Turn.", matches: matches });
        });
    }
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
        Match.create(req.user._id, req.body.opponentId, function (err, match, affected) {
            if (err) { return reportUnknownError(err, res); }
            if (!affected) {
                return res.json({ message: "Found Existing Match, New Match Not Created.", match: match });
            } else {
                User.pushNewMatchToUsers(match.players[0], match.players[1], match._id, function (err) {
                    if (err) { return reportUnknownError(err, res); }
                    subpub.publish(match.toObject(), "New Match Created");
                    res.json({ message: "Successfully Created Match", match: match });
                });
            }
        });
    };
    self.update = function (req, res)
    {
        var matchId = req.params.id;
        var move = JSON.parse(req.body.move);
        var pid = req.user._id;
        if (move) {
            Match.makeMove(matchId, move, pid, function (err, match) {
                if (err) { return reportUnknownError(err, res); }
                res.json({ message: "Successfully Made Move", match: match });
                subpub.publish(match.toObject(), subpub.EVENTS.playerMove);
                if (match.ai) {
                    Match.makeMoveAI(matchId, function (err, match, affected) {
                        if (err) {
                            throw err;
                        }
                        subpub.publish(match.toObject(), subpub.EVENTS.aiMove);
                    });
                }
            });
        }
    };
    self.forfeit = function (req, res)
    {
        Match.forfeitMatch(req.params.id, req.user._id, function (err, match) {
            if (err) { return reportUnknownError(err, res); }
            subpub.publish(match, subpub.EVENTS.forfeit);
            return res.json({ success: true, message: "Successfully Forfeited Match"});
        });
    };
}

module.exports = new MatchesConstructor();

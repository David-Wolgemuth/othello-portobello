/*****
    Match Mongoose Model
        .findAllContainingPlayers(idA, idB, function (err, matches) {})
        .findCurrentContainingPlayers(idA, idB, function (err, match) {})
        .findAllContainingPlayersFBID(fbidA, fbidB, function (err, matches) {})
        .findCurrentContainingPlayersFBID(fbidA, fbidB, function (err, match) {})
        .forfeitMatchWithFBID(matchId, loserFBID, function (err) {})
*/
var mongoose = require("mongoose");

var MatchSchema = new mongoose.Schema({
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    board: [],
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, {
    timestamps: true
});
MatchSchema.statics.findAllContainingPlayers = function (pidA, pidB, callback)
/*
    callback(err, matches)
*/
{
    this.find({
        $or: [
            { players: [pidA, pidB] }, 
            { players: [pidB, pidA] }
        ]
    }, callback);
};
MatchSchema.statics.findCurrentContainingPlayers = function (pidA, pidB, callback)
/*
    callback(err, match)
*/
{
    this.findAllContainingPlayers(pidA, pidB, function (err, matches) {
        if (err) {
            return callback(err);
        }
        for (var i = 0; i < matches.length; i++) {
            if (!matches[i].winner) {
                callback(null, matches[i]);
            }
        }
    });
};
MatchSchema.statics.findAllContainingPlayersFBID = function (fbidA, fbidB, callback)
/*
    callback(err, matches)
*/
{
    var User = mongoose.model("User");
    var self = this;
    User.findTwoUsersByFBID(fbidA,fbidB, function (userA, userB, err) {
        if (err) {
            return callback(err, null);
        }
        self.findAllContainingPlayers(userA, userB, callback);
    });
};
MatchSchema.statics.findCurrentContainingPlayersFBID = function (fbidA, fbidB, callback)
/*
    callback(err, match)
*/
{
    var User = mongoose.model("User");
    var self = this;
    User.findTwoUsersByFBID(fbidA,fbidB, function (userA, userB, err) {
        if (err) {
            return callback(err, null);
        }
        self.findCurrentContainingPlayers(userA, userB, callback);
    });
};
MatchSchema.statics.forfeitMatchWithFBID = function (matchId, loserFBID, callback)
/*
    callback(err)
*/
{
    var User = mongoose.model("User");
    var self = this;
    User.findByFBID(loserFBID, function (err, loser) {
        if (err) { return callback(err); }
        if (!loser) { return callback("User With Provided FaceBook Id Not Found."); }
        self.findOneById(matchId, function (err, match) {
            if (err) { return callback(false, err); }
            if (!match) { return callback("No Match Found Containing Provided Id"); }
            if (match.players[0] == loser._id) {
                match.winner = match.players[1];
            } else if (match.players[1] == loser._id) {
                match.winner = match.players[0];
            } else {
                return callback("Unknown Internal Error");
            }
            match.save(function (err) {
                if (err) { return callback(err); }
                callback();
            });
        });
    });
};
MatchSchema.pre("save", function (next) {
    if (!this.board.length) {
        this.board = othello.makeEmptyBoard();
    }
    next();
});

mongoose.model("Match", MatchSchema);

/*****
    Match Mongoose Model
*/
var mongoose = require("mongoose");
var othello = require("./othello.js");

var MatchSchema = new mongoose.Schema({
    winner: {
        type: Number,
        min: -1,  // `-1` -> tie game
        max: 2,
        default: 0  // `0` -> no winner (game still in play)
    },
    turn: {
        type: Number,
        min: 0,  // `0` -> game over 
        max: 2,
        default: 1
    },
    board: {
        type: String,
        default: JSON.stringify(othello.makeEmptyBoard())
    },
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    ai: {
        type: String,
        enum: ["easy_ai", "normal_ai"]
    }
}, {
    timestamps: true
});
MatchSchema.methods.getBoard = function ()
{
    return JSON.parse(this.board);
};
MatchSchema.statics.findAllContainingPlayer = function (pid, callback)
{
    var User = mongoose.model("User");
    User.findById(pid, function (err, user) {
        if (err) { callback(err); }
        User.populate(user, "matches", function (err, user) {
            console.log(user);
            callback(err, user.matches);
        });
    });
};
MatchSchema.statics.findAllContainingPlayers = function (pidA, pidB, callback)
/*
    callback(err, matches)
*/
{
    if (pidB == "easy_ai" || pidB == "normal_ai") {
        this.find({
            $and: [
                { players: [pidA] },
                { ai: pidB }
            ]
        }, callback);
    } else {
        this.find({
            $or: [
                { players: [pidA, pidB] }, 
                { players: [pidB, pidA] }
            ]
        }, callback);
    }
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
                return callback(null, matches[i]);
            }
        }
        return callback(null, null);
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
MatchSchema.statics.getValidMoves = function (matchId, callback)
/*
    callback(err, moves)
*/
{
    var self = this;
    self.findById(matchId, function (err, match) {
        if (err) { return callback(err); }
        if (!match) {
            return callback("No Match Found With Id: `" + matchId + "`");
        }
        var moves = othello.getAllValidMoves(match.getBoard(), match.turn);
        callback(null, moves);
    });
};
MatchSchema.statics.create = function (pidA, pidB, callback)
/*
    callback(err, match, affected)
*/
{
    var self = this; 
    self.findCurrentContainingPlayers(pidA, pidB, function (err, existing) {
        if (err) { return reportUnknownError(err, res); }
        if (existing) {
            return callback(null, existing, 0);
        }
        var match = new self();
        if (pidB == "easy_ai" || pidB == "normal_ai") {
            match.players = [pidA];
            match.ai = pidB;
        } else {
            match.players = [pidA, pidB];
        }
        match.save(callback);
    });
};
MatchSchema.statics.makeMove = function (matchId, move, playerId, callback)
/*
    callback(err, match, affected)
*/
{
    var self = this;
    self.findById(matchId, function (err, match) {
        if (err) { return callback(err); }
        if (match.winner) {
            return callback("Match Has Already Finished");
        }
        if (move.player != match.turn) {
            return callback("Isn't Player's Turn");
        }
        var isPlayersTurn = false;
        if (match.players[0].toString() == playerId) {
            if (match.turn == 1) {
                isPlayersTurn = true;
            }
        } else if (match.players[1].toString() == playerId) {
            if (match.turn == 2) {
                isPlayersTurn = true;
            }
        }
        if (!isPlayersTurn) {
            return callback("Isn't Player's Turn");
        }
        var invalid = othello.checkMoveIsValid(move);
        if (invalid) {
            return callback(invalid);
        }
        var board = match.getBoard();
        var flipped = othello.makeMove(board, move);
        match.board = JSON.stringify(board);
        if (!flipped) {
            return callback("No Tiles Flipped On Turn.");
        }
        if (match.turn == 1) { 
            match.turn = 2 
        } else if (match.turn == 2) { 
            match.turn = 1 
        }
        match.save(callback);
    });
};
MatchSchema.statics.makeMoveAI = function (matchId, callback)
{
    var self = this;
    self.findById(matchId, function (err, match) {
        if (err) { return callback(err); }
        if (!match) {
            return callback("Match Not Found With ID `" + matchId + "`");
        }
        var board = match.getBoard();
        var invalid = othello.checkBoardIsValid(board);
        if (invalid) {
            return callback(err);
        }
        if (match.turn != 2) {
            return callback(err);
        }
        var move;
        if (match.ai == "easy_ai") {
            move = othello.getRandomMove(board, 2);
        } else {
            move = othello.getMoveCornerOrMostFlipped(board, 2);
        }
        if (!move) {
            return callback("No Valid Moves. Is Game Over?");
        }
        othello.makeMove(board, move);
        match.board = JSON.stringify(board);
        match.turn = 1;
        match.save(callback);
    });
};
MatchSchema.statics.forfeitMatch = function (matchId, loserId, callback)
/*
    callback(err)
*/
{
    var self = this;
    self.findById(matchId, function (err, match) {
        if (err) { return callback(err); }
        if (!match) { return callback("No Match Found Containing Provided Id"); };
        if (match.winner) {
            return callback("Match Is Already Finished");
        }
        if (match.players[0].toString() == loserId) {
            match.winner = 2;
        } else if (match.players[1].toString() == loserId) {
            match.winner = 1;
        } else {
            return callback("User `" + loserId + "` Not Found In Match `" + match._id + "`");
        }
        match.save(function (err) {
            if (err) { return callback(err); }
            callback();
        });
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
        self.forfeitMatch(matchId, loser._id, callback);
    });
};
MatchSchema.pre("save", function (next) {
    
    next();
});

mongoose.model("Match", MatchSchema);

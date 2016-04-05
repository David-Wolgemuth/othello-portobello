/*****
    User Mongoose Model
*/

var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
    fbid: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    matches: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Match" 
    }]
}, {
    timestamps: true
});
UserSchema.statics.findByFBID = function (id, a, b)
/*
    (operates same as findById)
*/
{
    this.findOne({ fbid: id }, a, b);
};
UserSchema.statics.findTwoUsersByFBID = function (fbidA, fbidB, callback)
/*
    callback(err, user, opponent)
*/
{
    var User = this;
    User.findOne({ fbid: fbidA }, function (err, user) {
        if (err) {
            return callback(err, null, null);
        }
        User.findOne({ fbid: fbidB }, function (err, opponent){
            if (err) {
                return callback(err, null, null);
            }
            callback(null, user, opponent);
        });
    });
};
UserSchema.statics.pushNewMatch = function (pid, matchId, callback)
/*
    callback(err)
*/
{
    var User = this;
    User.findByIdAndUpdate(
        pid,
        { $push: { "matches": matchId }},
        { safe: true, upsert: true, new: true },
        function (err, player) {
            if (err) { return callback(err); }
            callback();
        }
    );
};
UserSchema.statics.pushNewMatchToUsers = function (pidA, pidB, matchId, callback)
/*
    callback(err)
*/
{
    var User = this;
    if (!pidA) {
        return callback();
    }
    User.pushNewMatch(pidA, matchId, function (err) {
        if (err) { return callback(err); }
        if (!pidB) {
            return callback();
        }
        User.pushNewMatch(pidB, matchId, callback);
    });
};
UserSchema.statics.winsLosses = function (pid, callback)
/*
    callback(err, stats)
*/
{
    var Match = mongoose.model("Match");
    Match.findAllContainingPlayer(pid, function(err, matches) {
        if (err) { return callback(err); }
        var stats = {
            wins: 0,
            losses: 0
        };
        if (!matches) {
            return callback(null, stats);
        }
        matches.forEach(function (match) {
            if (match.winner) {
                if (match.winner == pid) {
                    stats.wins++;
                } else {
                    stats.losses++;
                }
            }
        });
    });
};
UserSchema.statics.winsLossesAgainstPlayer = function (pidA, pidB, callback)
/*
    callback(err, stats)
*/
{
    var Match = mongoose.model("Match");
    Match.findAllContainingPlayers(pidA, pidB, function (err, matches) {
        if (err) { return callback(err); }
        var stats = {
            wins: 0,
            losses: 0
        };
        if (!matches) {
            return callback(null, stats);
        }
        matches.forEach(function (match) {
            if (match.winner) {
                if (match.winner == pid) {
                    stats.wins++;
                } else {
                    stats.losses++;
                }
            }
        });
    });
};

mongoose.model("User", UserSchema);

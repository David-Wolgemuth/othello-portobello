
var mongoose = require("mongoose");
var othello = require("../othello/othello.js");

var UserSchema = new mongoose.Schema({
    facebookId: {
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
{
    this.findOne({ facebookId: id }, a, b);
};
UserSchema.statics.findTwoUsersByFBID = function (pidA, pidB, callback)
{
    var User = this;
    if (!callback) { return; }
    User.findOne({ facebookId: pidA }, function (err, user) {
        if (err) { return callback(null, null, err); }
        User.findOne({ facebookId: pidB }, function (err, opponent){
            if (err) { return callback(null, null, err); }
            callback(user, opponent, err);
        });
    });
};
var MatchSchema = new mongoose.Schema({
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    board: [],
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
}, {
    timestamps: true
});
MatchSchema.statics.findAllContainingPlayers = function (pidA, pidB, callback)
{
    this.find({
        $or: [
            { players: [pidA, pidB] }, 
            { players: [pidB, pidA] }
        ]
    }, callback);
};
MatchSchema.statics.findCurrentContainingPlayers = function (pidA, pidB, callback)
{
    this.findAllContainingPlayers(pidA, pidB, function (err, matches) {
        if (err) {
            return callback(err);
        }
        for (var i = 0; i < matches.length; i++) {
            if (!matches[i].winner) {
                console.log("HEREHER");
                callback(null, matches[i]);
            }
        }
    });
};

MatchSchema.pre("save", function (next) {
    if (!this.board.length) {
        this.board = othello.makeEmptyBoard();
    }
    next();
});

mongoose.model("User", UserSchema);
mongoose.model("Match", MatchSchema);

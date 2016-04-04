/*****
    User Mongoose Model
        .findByFBID(fbid, _, _)  // Use same as findById
        .findTwoUsersByFBID(idA, idB, function (err, user, opponent){})
*/

var mongoose = require("mongoose");

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
/*
    (operates same as findById)
*/
{
    this.findOne({ facebookId: id }, a, b);
};
UserSchema.statics.findTwoUsersByFBID = function (pidA, pidB, callback)
/*
    callback(err, user, opponent)
*/
{
    var User = this;
    if (!callback) { return; }
    User.findOne({ facebookId: pidA }, function (err, user) {
        if (err) {
            return callback(err, null, null);
        }
        User.findOne({ facebookId: pidB }, function (err, opponent){
            if (err) {
                return callback(err, null, null);
            }
            callback(null, user, opponent);
        });
    });
};

mongoose.model("User", UserSchema);

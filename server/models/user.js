
var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
    facebookId: {
        type: String  // to get image:  src="graph.facebook.com/{{fid}}/picture?type=large"
    },
    name: {
        type: String
    },
}, {
    timestamps: true
});

mongoose.model("User", UserSchema);

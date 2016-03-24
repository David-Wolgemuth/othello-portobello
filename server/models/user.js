var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
    facebookId: {
        // to get image:  src="graph.facebook.com/{{fid}}/picture?type=large"
        type: String
    },
    name: {
        type: String
    },
}, {
    timestamps: true
});

mongoose.model("User", UserSchema);
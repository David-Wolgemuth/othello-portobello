
var mongoose = require("mongoose");
var User = mongoose.model("User");

module.exports = (function () {
    var Users = {};
    Users.show = function (req, res) {
        if (req.facebookId != req.params.id) {
            res.status(401).json({ message: "Unauthorized Access" });
        }
        User.findOne({ facebookId: req.facebookId }, function (err, user) {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: err });
            }
            return res.json({ message: "User Data", userdata: user });
        });
    };
    Users.create = function (req, res) {
        if (!req.facebookId || !req.body.name || req.facebookId != req.body.id) {
            var error = "Error Logging In User.  User's id or name not included.";
            console.log(error);
            return res.status(500).json({ message: error});
        }
        User.findOneAndUpdate(
            { facebookId: req.body.id }, 
            { name: req.body.name }, 
            { upsert: true },
            function (err, user) 
            {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: err });
                } else if (!user) {
                    return res.json({ message: "User Created" });
                } else {
                    return res.json({ message: "\"" + user.name + "\" Succesfully Logged In" });
                }
            }
        );
    };
    return Users;
})();

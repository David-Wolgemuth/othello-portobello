
var fs = require('fs');
var keys;

try {
    var keysFile = fs.readFileSync('keys.json', 'utf8');
    keys = JSON.parse(keysFile);
} catch(err) {
    keys = {
        facebook: {
            clientID: process.env.FACEBOOK_CLIENT_ID, 
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET
        },
        mongolab: {
            user: process.env.MONGO_USER,
            password: process.env.MONGO_PASSWORD
        },
    };
}

module.exports = (function () {
    return keys;
}) ();

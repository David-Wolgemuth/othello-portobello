

function authenticateJWT(req, res, next) 
{
    /*
        Authorizes JSON Web Tokens
    */
    var token = req.headers["x-access-token"];
    if (token) {
        jwt.verify(token, secret, function (err, decoded) {
            if (err) {
                return res.status(401).json({
                    message: "Unauthorized Token."
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).json({
            message: "No Token Provided."
        });
    }
}

module.exports = (function (keys) {

    var Auth = {};
    var facebookOptions = {
        clientID: keys.fb.ID,
        clientSecret: keys.fb.secret,
        callbackURL: "http://localhost:5000/auth/facebook/callback"
    };


}) ();

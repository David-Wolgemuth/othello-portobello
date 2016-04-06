
var authenticate = require("./authentications.js").fb.sockets;
var Match = mongoose.model("Match");

function SubPubServerConstructor()
{
    var self = this;
    var io;
    self.messages = {
        playerMove: "player-move",
        aiMove: "ai-move",
        forfeit: "forfeit"
    } 
    self.init = function (app)
    {
        var server = require("http").Server(app);
        io = require("socket.io")(server);
        io.sockets.on("connection", function (socket) {
            authenticate(socket, function (err, user) {
                if (err) {
                    return socket.emit("error", err);
                }
                socket.user = user;
            });
            socket.on("subscribe", function (room) { subscribe(socket, room); });
            socket.on("unsubscribe", function (room) { unsubscribe(socket, room); });
        });
    };
    self.publish = function (match, message)
    {
        var id = match._id;
        _publish({ type: "match", id: id }, { message: message, match: match});
        match.players.forEach(function (player) {
            _publish({ type: "user-all", id: player._id }, { message: message, match: match });
        });
    };
    function subscribe(socket, room)
    {
        switch (room.type) {
            case "match":
                checkIfUserInMatch(socket.user, room.id, function (err, inMatch) {
                    if (err || !inMatch) {
                        return socket.emit("error", err);
                    }
                    socket.join(room.id);
                });
                break;
            case "user-all":
                if (socket.user && room.id && socket.user._id == room.id) {
                    socket.join(room.id);
                }
                break;
        }
    }
    function _publish(room, data)
    {
        io.sockets.in(room.id).emit(data);
    }
    function unsubscribe(socket, room)
    {
        socket.leave(room.id);
    }
    function checkIfUserInMatch(user, matchId, callback)
    {
        if (!user || !user._id) {
            return callback("No User Id Provided", false);
        }
        Match.findById(matchId).lean().exec(function (err, match) {
            if (err) { return callback(err, false); }
            if (!match) {
                return callback("Match Not Found", false);
            }
            if (match.players[0] == user._id) {
                callback(null, true);
            }
        });
    }
}

module.exports = new SubPubServerConstructor();

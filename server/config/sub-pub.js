
var authenticate = require("./authentications.js").fb.sockets;
var Match = require("mongoose").model("Match");

function SubPubServerConstructor()
{
    var self = this;
    var io;
    self.EVENTS = {
        playerMove: "player-move",
        aiMove: "ai-move",
        forfeit: "forfeit"
    };
    self.init = function (server)
    {
        io = require("socket.io").listen(server);
        io.use(authenticate);
        io.sockets.on("connection", function (socket) {
            console.log("New Connection:", socket.id);
            socket.on("subscribe", function (room) { subscribe(socket, room); });
            socket.on("unsubscribe", function (room) { unsubscribe(socket, room); });
        });
    };
    self.publish = function (match, message)
    {
        var id = match._id;
        _publish({ type: "match", id: id }, { message: message, match: match});
        match.players.forEach(function (player) {
            _publish({ type: "user-all", id: player }, { message: message, match: match });
        });
    };
    function subscribe(socket, room)
    {
        console.log("Subscription:", room);
        switch (room.type) {
            case "match":
                checkIfUserInMatch(socket.user, room.id, function (err, inMatch) {
                    if (err || !inMatch) {
                        return socket.emit("message", err);
                    }
                    socket.join(room.id);
                    socket.emit("message", "Successfully Joined Match: " + room.id);
                });
                break;
            case "user-all":
                if (socket.user && room.id && socket.user._id == room.id) {
                    socket.join(room.id);
                    socket.emit("message", "Successfully Subscribed To User: " + room.id)
                }
                break;
        }
    }
    function _publish(room, data)
    {
        io.sockets.in(room.id).emit(room.type, data);
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
            if (match.players[0].toString() == user._id || match.players[1].toString() == user._id) {
                return callback(null, true);
            }
            return callback("Not In Match", false);
        });
    }
}

module.exports = new SubPubServerConstructor();

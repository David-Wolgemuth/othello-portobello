
module.exports = SocketFactory;

function SocketFactory (Auth)
{
    var socket;
    var subscriptions = {};
    var token;
    var factory = {};
    Auth.onLogin(function () {
        init();
    });
    
    factory.subscribe = function (sub, callback)
    {
        if (!sub.type || !sub.id) {
            throw "Invalid Subscription:" + sub;
        }
        if (typeof(callback) != "function") {
            throw "Invalid Function:" + callback;
        }
        if (subscriptions[sub.id]) {
            subscriptions[sub.id].callbacks.push(callback);
        } else {
            subscriptions[sub.id] = { id: sub.id, type: sub.type, callbacks: [callback] };
            emit("subscribe", roomFromObjectId(sub.id));
        }
    };
    factory.unsubscribe = function (id)
    {
        var room = roomFromObjectId(id);
        if (room) {
            socket.emit("unsubscribe", room);
            delete subscriptions[id];
        }
    };
    function init ()
    {
        if (!Auth.token) {
            throw "No Token, Should Not Initialize Socket"
        }
        var handshake = "x-auth-token=" + Auth.token;
        socket = io.connect("http://localhost:5000", { query: handshake });
        socket.on("connect", function (data) {
            console.log("Successful Socket Connection:", data);
            resubscribeAll();
        });
        socket.on("message", function (data) {
            console.log("Message From Server:", data);
        });
        socket.on("match", function (data) {
            console.log("Incoming Subscribed Match:", data);
            match = data.match;
            runAllCallbacks(match._id, match);
        });
        socket.on("user-all", function (data) {
            console.log("Incoming User All:", data);
            match = data.match;
            if (match) {
                runAllCallbacks(match._id, match);
            }
        });
    }
    function emit (message, data)
    {
        if (token) {
            data.token = token;
            socket.emit(message, data);
        }
    }
    function runAllCallbacks (id, obj)
    {
        var sub = subscriptions[id];
        if (sub) {
            for (var i = 0; i < sub.callbacks.length; i++) {
                sub.callbacks[i](obj);
            }
        }
    }
    function roomFromObjectId (id)
    {
        if (subscriptions[id]) {
            return { id: id, type: subscriptions[id].type };
        }
        return null;
    }
    function resubscribeAll ()
    {
        token = Auth.token;
        if (!token) { 
            console.log("Not Logged In, Cannot Subscribe");
            return;
        }
        for (var id in subscriptions) {
            var room = roomFromObjectId(id);
            if (room) {
                emit("subscribe", room);
            }
        }
    }

    return factory;
}

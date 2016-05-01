
module.exports = MatchFactory;

// console.log("Hello");

function MatchFactory ($q, $http, User, Socket)
{
    var factory = {};
    factory.matches = [];
    factory.match = null;

    var callbacks = {
        switched: [],
        shouldMakeMove: [],
        refresh: []
    };
    factory.on = function (listener, callback)
    {
        if (typeof(callback) === "function" && callbacks[listener]) {
            callbacks[listener].push(callback);
        }
    };
    factory.unsubscribe = function (id)
    {
        if (!id && factory.match) {
            id = factory.match._id;
        }
        Socket.unsubscribe(id);
    };
    factory.subscribe = function (callback)
    {
        if (!factory.match) {
            throw "No Match To Subscribe To";
        }
        Socket.subscribe({ type: "match", id: factory.match._id }, callback);
    };
    factory.refresh = function ()
    {
        if (factory.match) {
            return factory.getMatch(factory.match._id);
        } else {
            var deferred = $q.defer();
            deferred.resolve(null);
            return deferred.promise;
        }
    };
    factory.switchMatch = function (id)
    {
        return factory.getMatch(id, "switched");
    };
    factory.getMatch = function (id, callbackKey)
    {
        var deferred = $q.defer();

        $http.get("/matches/" + id)
        .then(function (res) {
            var match = res.data.match;
            if (match) {
                factory.match = match;
                deferred.resolve(match);
                callbacks.switched.forEach(function (callback) {
                    callback(match);
                });
            } else {
                console.log("Error:", res.data);
                deferred.reject(res.data);
            }
        })
        .catch(function (error) {
            console.log("Error:", error);
            deferred.reject();
        });

        return deferred.promise;
    };
    factory.getAllContainingPlayer =  function ()
    {
        var deferred = $q.defer();

        $http.get("/matches?current=true")
        .then(function (res) {
            if (Array.isArray(res.data.matches)) {
                factory.matches = res.data.matches;
                setMatchesInfo();
                deferred.resolve(factory.matches);
            } else {
                console.log("Error:", res);
                deferred.reject();
            }
        })
        .catch(function (res) {
            console.log("Error Getting Matches:", res);
            deferred.reject(res);
        });

        return deferred.promise;
    };
    factory.makeMove = function (move)
    {
        console.log("Move:", move);

        var deferred = $q.defer();

        for (var i = 0; i < callbacks.shouldMakeMove.length; i++) {
            var shouldMakeMove = callbacks.shouldMakeMove[i]();
            if (!shouldMakeMove) {
                deferred.reject("Blocked By Controller");
                return deferred.promise;  // Allow Other Controllers To Block Move
            }
        }

        $http.put("/matches/" + factory.match._id, { move: move })
        .then(function (res) {
            console.log(res);
            var match = res.data.match;
            if (match) {
                factory.match = match;
                deferred.resolve(match);
            } else {
                deferred.reject(res);
            }
        })
        .catch(function (err) {
            console.log(err);
            deferred.reject(err);
        });

        return deferred.promise;
    };
    function setMatchesInfo()
    {
        var user = User.user;
        for (var i = factory.matches.length - 1; i >= 0; i--) {
            var match = factory.matches[i];

            if (match.players[0] === user._id) {
                match.userNum = 1;
            } else {
                match.userNum = 2;
            }
            match.currentTurn = Boolean(match.turn === match.userNum);

            var opponent = {};
            if (match.ai) {
                opponent._id = match.ai;
                opponent.imgSmall = "/images/" + match.ai + ".png";
                if (match.ai == "easy_ai") {
                    opponent.name = "Easy AI";
                } else if (match.ai == "normal_ai") {
                    opponent.name = "Normal AI";
                }
            } else {
                opponent = (match.players[0]._id == user._id) ? match.players[1] : match.players[0];
                if (!opponent) {
                    factory.matches.splice(i, 1);
                    continue;
                }
                opponent.imgSmall = "https://graph.facebook.com/" + opponent.fbid + "/picture?type=small";
            }
            match.opponent = opponent;
        }
    }

    return factory;
}


function MatchFactory ($q, $http, User)
{
    var factory = {};
    factory.matches = [];

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

    function setMatchesInfo()
    {
        var user = User.user;
        for (var i = factory.matches.length - 1; i >= 0; i--) {
            var match = factory.matches[i];

            match.currentTurn = Boolean(match.players[match.turn - 1] && match.players[match.turn - 1]._id == user._id);
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

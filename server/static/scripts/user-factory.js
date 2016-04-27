
function UserFactory ($q, $http, authenticationFactory)
{
    var factory = {};
    factory.user = null;
    factory.users = [];

    factory.getUser = function ()
    {
        var deferred = $q.defer();

        $http.get("/users/me")
        .then(function (res) {
            factory.user = res.data;
            console.log("Got User:", factory.user);
            deferred.resolve(factory.user);
        })
        .catch(function (res, status) {
            console.log("Error:", res, status);
            deferred.reject();
        });

        return deferred.promise;
    };
    factory.getUsers = function ()
    {
        var deferred = $q.defer();

        $http.get("/users")
        .then(function (res) {
            if (Array.isArray(res.data.users)) {
                console.log("Users:", res.data.users);
                factory.users = res.data.users;
                factory.getFriends()
                .then(function (friends) {
                    console.log("Friends:", friends);
                    mapUsersAsFriends(friends);
                    deferred.resolve(factory.users);
                })
                .catch(deferred.reject);
            } else {
                deferred.reject();
            }
        })
        .catch(function (res, status) {
            console.log("Error:", res, status);
            deferred.reject();
        });

        return deferred.promise;
    };

    factory.getFriends = function ()
    {
        var deferred = $q.defer();

        FB.api("/me/friends", function (response) {
            if (!response) {
                console.log("Error Getting Friends");
                deferred.reject('Error occured');
            } else if (response.error) {
                console.log("Error:", response.error);
                deferred.reject(response.error);
            } else {
                deferred.resolve(response);
            }
        });

        return deferred.promise;
    };

    factory.createUser = function (user)
    {
        var deferred = $q.defer();

        $http.post("/users", user)
        .then(function (res) {
            console.log("Successfully Created User:", user);
            factory.user = res.data;
            deferred.resolve(factory.user);
        })
        .catch(function (res, status) {
            console.log("Error:", res, status);
            deferred.reject();
        });

        return deferred.promise;
    };
    factory.createUserIfNotExists = function (user)
    {
        var deferred = $q.defer();

        factory.getUser()
        .then(function (user) {
            deferred.resolve(user);
        })
        .catch(function (_, status) {
            if (status == 404) {
                factory.createUser(user)
                .then(function () {
                    deferred.resolve();
                })
                .catch(deferred.reject);
                return;
            }
            deferred.reject();
        });

        return deferred.promise;
    };

    function mapUsersAsFriends(friends)
    {
        for (var i = 0; i < factory.users.length; i++) {
            for (var j = 0; j < friends.length; j++) {
                console.log("BHBHBH");
                if (factory.users[i].fbid == friends[j].id) {
                    factory.users[i].friend = true;
                }
            }
        }
    }

    return factory;
}
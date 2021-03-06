
module.exports = AuthenticationFactory;

function AuthenticationFactory ($q, $http)
{
    var factory = {};
    factory.token = null;

    var callbacks = {
        login: []
    };

    factory.onLogin = function (callback)
    {
        if (typeof(callback) === "function") {
            callbacks.login.push(callback);
        }
    };
    
    factory.getLoginStatus = function () 
    {
        var deferred = $q.defer();

        FB.getLoginStatus(function(response) {
            factory.statusChangedCallback(response)
            .then(deferred.resolve)
            .catch(deferred.reject);
        });

        return deferred.promise;
    }
    factory.statusChangedCallback = function (response)
    {
        var deferred = $q.defer();

        switch (response.status) {
            case ("connected"):
                factory.setToken(response.authResponse.accessToken);
                factory.getUser()
                .then(function () {
                    callbacks.login.forEach(function (callback) {
                        callback();
                    });
                    deferred.resolve();
                })
                .catch(deferred.reject);
                break;
            default:
                factory.setToken(null);
                deferred.reject(response.status);
        }

        return deferred.promise;
    };
    factory.setToken = function (token)
    {
        console.log(token);
        factory.token = token;
        $http.defaults.headers.common["x-auth-token"] = factory.token;
    };

    factory.login = function ()
    {
        var deferred = $q.defer();

        FB.login(function (response) {
            authenticationFactory.statusChangedCallback(response)
            .then(deferred.resolve)
            .catch(deferred.reject);
        });

        return deferred.promise;
    };

    factory.logout = function (cb) { FB.logout(cb); };

    factory.getUser = function ()
    {
        var deferred = $q.defer();
        FB.api("/me", function(response) {
            if (!response) {
                deferred.reject('Error occured');
            } else if (response.error) {
                deferred.reject(response.error);
            } else {
                deferred.resolve(response);
            }
        });
        return deferred.promise;
    };

    return factory;
}

// Init Facebook
window.fbAsyncInit = function()
{
    FB.init({ 
        appId: "1056352804406476",
        status: true, 
        cookie: true, 
        xfbml: true,
        version: 'v2.4'
    });
};

// Append Facebook Script To Document
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


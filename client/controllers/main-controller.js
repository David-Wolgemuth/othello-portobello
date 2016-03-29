othelloModule

.factory("mainFactory", function ($http, $cookies) {
    var factory = {};
    factory.token = "";
    function getToken(callback) {
        var token = factory.token;
        if (token) {
            callback(token);
        } else {
            token = $cookies.get("token");
            if (token) {
                factory.token = token;
            }
            callback(token);
        }
    }
    function setToken(token) {
        $cookies.put("token", token);
        factory.token = token;
    }
    function facebookLogin(callback) {
        $http({
            url: "http://localhost:5000/auth/facebook",
            method: "JSON",
            withCredentials: false
        }).then(function (res) {
            console.log("res.data:",res.data);
            var token = res.data.issuedToken;
            setCookie(token);
            callback(Boolean(token));
        });
    }
    factory.login = function (callback) {
        getToken(function(token) {
            if (token) {
                console.log("Token:", token);
                callback(true);
            } else {
                facebookLogin(function(success) {
                    callback(success);
                });
            }
        });
    };
    factory.logout = function () {
        $http({
            url: "/logout",
            method: "GET",
        }).then(function (res) {
            $cookies.remove("token");
        });
    };
    return factory;
})
.controller("mainController", function ($scope, mainFactory) {
    
    var mc = this;
    mc.test = "What up Brah";
    mc.loggedIn = false;
    mc.login = function () {
        mainFactory.login(function (loggedIn) {
            mc.loggedIn = loggedIn;
        });
    };
});

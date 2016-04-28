(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

module.exports = MainController;

function MainController (Auth, User, Match, $document, $scope)
{
    var self = this;
    self.hamburger = false;
    self.toggleVisibleGames = false;

    self.login = function ()
    {
        Auth.login()
        .then(function () {
            self.didLogIn();
        })
        .catch(function() {
            self.loggedIn = false;
        });
    };
    self.logout = function ()
    {
        Auth.logout(function () {
            $scope.$apply(function () {
                self.loggedIn = false;
            });
        });
    };
    self.checkLoginState = function ()
    {
        Auth.getLoginStatus()
        .then(function () {
            User.createUserIfNotExists()
            .then(function () {
                self.didLogIn();
            })
            .catch(function () {
                console.log("Error Creating User / Logging In");
                self.loggedIn = false;
            });
        })
        .catch(function (error) {
            console.log("Login Error:", error);
            self.loggedIn = false;
        });
    };
    self.didLogIn = function ()
    {
        self.loggedIn = true;
        User.getUsers();
        Match.getAllContainingPlayer();
    };


    $document.ready(function () {
        setTimeout(self.checkLoginState, 1000);
    });
}

},{}],2:[function(require,module,exports){

module.exports = PixiController;

function PixiController ($window, $scope)
{
    // You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
    // which will try to choose the best renderer for the environment you are in.

    var canvas = angular.element(document.querySelector("#pixi-canvas"));
    var pixi = angular.element(canvas.parent());
    console.log(pixi);
    var renderer = new PIXI.autoDetectRenderer(800, 800, { view: canvas[0] });

    // The renderer will create a canvas element for you that you can then insert into the DOM.

    // You need to create a root container that will hold the scene you want to draw.
    var stage = new PIXI.Container();

    // Declare a global variable for our sprite so that the animate function can access it.
    var bunny = null;

    var graphics = new PIXI.Graphics();
    graphics.beginFill(0xFFFF00);

    // set the line style to have a width of 5 and set the color to red
    graphics.lineStyle(5, 0xFF0000);

    // draw a rectangle
    graphics.drawRect(0, 0, 300, 200);

    stage.addChild(graphics);



    function resize ()
    {
        console.log("Resizing");
        var width = $window.innerWidth;
        var height = $window.innerHeight;
        var hamburger = 36;
        if (width < height - hamburger) {
            renderer.resize(width, width);
            pixi.css("left", 0);
        } else {
            var w = height - hamburger;
            var x = (width - (w)) / 2;
            renderer.resize(w, w);
            pixi.css("left", x + "px");
        }
    }
    resize();
    angular.element($window).bind('resize', function () {
        resize();
    });

    // load the texture we need
    PIXI.loader.add('bunny', 'images/easy_ai.png').load(function (loader, resources) {
        // This creates a texture from a 'bunny.png' image.
        bunny = new PIXI.Sprite(resources.bunny.texture);

        // Setup the position and scale of the bunny
        bunny.position.x = 400;
        bunny.position.y = 300;

        bunny.scale.x = 2;
        bunny.scale.y = 2;

        // Add the bunny to the scene we are building.
        stage.addChild(bunny);

        // kick off the animation loop (defined below)
        animate();
    });

    function animate() {
        // start the timer for the next animation loop
        requestAnimationFrame(animate);

        // each frame we spin the bunny around a bit
        bunny.rotation += 0.01;

        // this is the main render call that makes pixi draw your container and its children.
        renderer.render(stage);
    }
}

},{}],3:[function(require,module,exports){

module.exports = SideBarController;

function SideBarController (Auth, User, Match)
{
    var self = this;

    self.update = function ()
    {
        self.users = User.users;
        self.matches = Match.matches;
    };

}

},{}],4:[function(require,module,exports){

module.exports = function (app)
{
    app.directive("sidebar", function () {
        return {
            templateUrl: "views/sidebar.html"
        };
    })
    .directive('pixi', function () {
        return {
            template: "<canvas id='pixi-canvas'></canvas>",
            controller: require("./controllers/pixi-controller"),
        };
    });
}

},{"./controllers/pixi-controller":2}],5:[function(require,module,exports){

module.exports = AuthenticationFactory;

function AuthenticationFactory ($q, $http)
{
    var factory = {};
    factory.token = null;

    factory.onLogin = [];
    
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

        $http.defaults.headers.common["x-auth-token"] = factory.token;

        switch (response.status) {
            case ("connected"):
                factory.setToken(response.authResponse.accessToken);
                factory.getUser()
                .then(function () {
                    factory.onLogin.forEach(function (callback) {
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


},{}],6:[function(require,module,exports){

module.exports = MatchFactory;

// console.log("Hello");

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

},{}],7:[function(require,module,exports){

module.exports = UserFactory;

function UserFactory ($q, $http)
{
    var factory = {};
    factory.user = null;
    factory.users = [];

    factory.getUser = function ()
    {
        var deferred = $q.defer();

        $http.get("/users/me")
        .then(function (res) {
            factory.user = res.data.user;
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
                factory.users = res.data.users;
                factory.getFriends()
                .then(function (friends) {
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
                deferred.resolve(response.data);
            }
        });

        return deferred.promise;
    };

    factory.createUser = function (user)
    {
        var deferred = $q.defer();

        $http.post("/users", user)
        .then(function (res) {
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
        for (var i = factory.users.length - 1; i >= 0; i--) {
            if (factory.users[i]._id == factory.user._id) {
                factory.users.splice(i, 1);
                continue;
            }
            for (var j = 0; j < friends.length; j++) {
                if (factory.users[i].fbid == friends[j].id) {
                    factory.users[i].friend = true;
                }
            }
        }
    }

    return factory;
}
},{}],8:[function(require,module,exports){

var othelloModule = angular.module("othelloApp", ["ngRoute", "ngHamburger"])
.factory("authenticationFactory", [
    "$q", "$http",
    require("./factories/authentication-factory")
])
.factory("userFactory", [
    "$q", "$http",
    require("./factories/user-factory")
])
.factory("matchFactory", [
    "$q", "$http", "userFactory",
    require("./factories/match-factory")
])
.controller("sidebarController", [
    "authenticationFactory", "userFactory", "matchFactory", 
    require("./controllers/sidebar-controller")
])
// .controller("pixiController", [
//     "$window", "$scope",
//     require("./controllers/pixi-controller")
// ])
.controller("mainController", [
    "authenticationFactory", "userFactory", "matchFactory", "$document", "$scope", 
    require("./controllers/main-controller")
]);

require("./directives.js")(othelloModule);

},{"./controllers/main-controller":1,"./controllers/sidebar-controller":3,"./directives.js":4,"./factories/authentication-factory":5,"./factories/match-factory":6,"./factories/user-factory":7}]},{},[8]);

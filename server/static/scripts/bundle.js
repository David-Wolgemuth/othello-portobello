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

var globals = require("../globals.js");

function PixiController ($window, $scope)
{
    // You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
    // which will try to choose the best renderer for the environment you are in.

    var canvas = angular.element(document.querySelector("#pixi-canvas"));
    var pixiElement = angular.element(canvas.parent());
    console.log(pixiElement);

    var GameSetup = require("../game/game-setup.js");
    var game = new GameSetup(canvas[0]);
    angular.element($window).bind("load", function () {
        resize();
        game.start();
    });
    angular.element($window).bind("resize", function () {
        resize();
    });
    function resize ()
    {
        console.log("Resizing");
        var width = $window.innerWidth;
        var height = $window.innerHeight;

        var hamburger = 36;

        var d;
        if (width < height - hamburger) {
            d = width;
            pixiElement.css("left", 0);
        } else {
            d = height - hamburger;
            var x = (width - (d)) / 2;
            pixiElement.css("left", x + "px");
        }
        game.resize(d);
    }

    
}

},{"../game/game-setup.js":9,"../globals.js":10}],3:[function(require,module,exports){

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

var globals = require("../globals.js");

module.exports = Board;

function Board (game)
{
    var self = this;
    self.game = game;
    self.container = new PIXI.Container();

    self.grid = [];

    makeGrid();
    addGridToContainer();

    self.set = function (grid)
    {
        if (!self.grid || !grid) { 
            console.log("Upgrade Grid Failed");
            return;
        }
        eachGridTile(function (tile) {
           var player = grid[tile.row][tile.column]; 
           tile.mushroom.flip(player);
        });
    };

    function eachGridTile (callback)
    {
        for (var row = 0; row < self.grid.length; row++) {
            for (var column = 0; column < self.grid[row].length; column++) {
                callback(self.grid[row][column], self.grid.tileDiameter);
            }
        }
    }

    function makeGrid ()
    {
        self.grid.tileDiameter = globals.width / 8;

        for (var row = 0; row < 8; row++) {
            self.grid.push([]);

            for (var column = 0; column < 8; column++) {
                var diameter = self.grid.tileDiameter;

                var x = diameter * row;
                var y = diameter * column;

                var tile = { x: x, y: y, row: row, column: column };
                
                var player = 0;
                tile.mushroom = new Mushroom(tile, diameter, game);
                self.grid[row].push(tile);
            }
        }
    }

    function addGridToContainer ()
    {
        var graphics = new PIXI.Graphics();
        var mushrooms = new PIXI.Container();

        graphics.beginFill(globals.colors.olive);
        graphics.lineStyle(4, globals.colors.brown);

        eachGridTile(function (tile, diameter) {
            console.log(tile.x, tile.y, diameter);
            graphics.drawRect(tile.x, tile.y, diameter, diameter);
            mushrooms.addChild(tile.mushroom.sprite);
        });

        self.container.addChild(graphics);
        self.container.addChild(mushrooms);
    }    
}

function Mushroom (tile, diameter, game)
{
    var self = this;
    self.player = 0;
    self.game = game;
    self.sprite = new PIXI.Sprite();
    setSprite(self.sprite, tile);
    
    self.flip = function (player)
    {
        var texture = getTextureForPlayer(player);
        var endRotation = (player === self.game.player) ? 2 * Math.PI : Math.PI;
        var prev = self.player;
        self.player = player;

        if (!prev || prev === player) {  // First Time Placed or Same Player, Should Not Rotate
            setFinal();
            self.game.render();
        } else {
            requestAnimationFrame(rotate);
        }

        function setFinal ()
        {
            if (endRotation == 2 * Math.PI) {
                endRotation = 0;
            }
            self.sprite.rotation = endRotation;
            self.sprite.texture = texture;
        }
        function rotate ()
        {
            if (self.sprite.rotation < endRotation) {
                self.sprite.rotation += 0.08;
                requestAnimationFrame(rotate);
            } else {
                setFinal();
            }
            self.game.render();
        }
    };

    function setSprite(sprite, tile) {
        sprite.anchor = new PIXI.Point(0.5, 0.5);  // Allow it to rotate around center

        sprite.width = diameter;
        sprite.height = diameter;

        sprite.position.x = tile.x + (diameter * 0.5); // Make up for changed anchor
        sprite.position.y = tile.y + (diameter * 0.5);

        sprite.interactive = true;
        sprite.on('mouseup', flip);
        function flip ()
        {
            var player = (self.player === 2) ? 1 : 2;
            self.flip(player);
        }
    }

    function getTextureForPlayer(player)
    {
        switch (player) {
            case 1: 
                return globals.textures.mushroomRed.texture;
            case 2: 
                return globals.textures.mushroomBlue.texture;
            default:
                console.log("Invalid Player For Flip");
                return null;
        }
    }
}


},{"../globals.js":10}],9:[function(require,module,exports){

module.exports = GameSetup;

var globals = require("../globals.js");
var colors = globals.colors;
var Board = require("./game-board.js");

function GameSetup (canvas)
{
    var self = this;
    self.renderer = new PIXI.autoDetectRenderer(globals.width, globals.width, { view: canvas, transparent: true });
    self.stage = new PIXI.Container();
    self.resources = null;

    self.player = 1;  // Temp for Test

    self.board = null;

    self.resize = function (d)
    {
        self.renderer.resize(d, d);
        var scale = d / globals.width;
        self.stage.scale.x = scale; self.stage.scale.y = scale;
    };
    self.start = function ()
    {
        self.backgroundColor = colors.white;
        globals.load()
        .then(function() {
            var board = new Board(self);
            console.log(board);
            console.log(self.renderer);
            self.stage.addChild(board.container);
            self.render();
        });
    };
    self.render = function ()
    {
        self.renderer.render(self.stage);
    }
}


},{"../globals.js":10,"./game-board.js":8}],10:[function(require,module,exports){

module.exports = new Globals();
function Globals()
{
    var self = this;
    self.width = 8 * 120;
    self.colors = {
        olive: 0xA0AF99,
        brown: 0x847360,

        // olive: 0xC5C7B3,
        // brown: 0xA29380,
        

        brown2:0x9B7E5A,
        tan: 0xD9CCBA,
        white: 0xEFEEE9
    };
    self.textures = null;
    var loaded = false;
    self.load = function ()
    {
        var promise = new Promise(function (resolve, reject) {
            if (loaded) {
                return resolve();
            }
            PIXI.loader
            .add("mushroomRed", "images/mushroom-tile-red.png")
            .add("mushroomBlue", "images/mushroom-tile-blue.png")
            .load(function (loader, resources) {
                self.textures = resources;
                resolve();
            });
        });
        return promise;
    };
}

},{}],11:[function(require,module,exports){

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

},{"./controllers/main-controller":1,"./controllers/sidebar-controller":3,"./directives.js":4,"./factories/authentication-factory":5,"./factories/match-factory":6,"./factories/user-factory":7}]},{},[11]);

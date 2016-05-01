(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*****
    Othello Game
*/

module.exports = new OthelloLogic();

//------------ Constants -------------//

var TILES = 8;
var DIRECTIONS = [
    [0, 1], [1, 1], [1, 0], [1, -1], 
    [0, -1], [-1, -1], [-1, 0], [-1, 1]
];

//------------ Othello Object + Methods -------------//

function OthelloLogic() {
    var self = this;
    
    self.makeEmptyBoard = function ()
    /*
        ->  [[0, 0, ...],  ...]
    */
    {
        var board = [];
        for (var y = 0; y < TILES; y++) {
            board.push([]);
            for (var x = 0; x < TILES; x++) {
                board[y].push(0);
            }
        }
        board[3][3] = 1; board[3][4] = 2;
        board[4][3] = 2; board[4][4] = 1;
        return board;
    };
    self.tilesFlippedOnMove = function (board, move)
    /* 
        ->  [{ x: Int, y: Int }]
    */
    {
        self.validate({ board: board, move: move });

        var flipped = [];
        if (board[move.y][move.x]) {
            // Already Has Tile
            return flipped;
        }
        DIRECTIONS.forEach(function (direction) {
            flipped.push.apply(flipped, checkDirection(board, move, direction));
        });
        return flipped;
    };
    self.getAllValidMoves = function (board, player)
    /*
        ->  [{ x: Int, y: Int, flipped: Int, player: Int }]
    */
    {
        self.validate({ board: board, player: player });

        var moves = [];
        if (!player) {  // Game Over
            return moves;
        }
        for (var x = 0; x < TILES; x++) {
            for (var y = 0; y < TILES; y++) {
                var move = { x: x, y: y, player: player };
                move.flipped = self.tilesFlippedOnMove(board, move).length;
                if (move.flipped) {
                    moves.push(move);
                } 
            }
        }
        return moves;
    };
    self.getRandomMove = function (board, player)
    /*
        ->  { x: Int, y: Int, flipped: Int, player: Int }
    */
    {
        self.validate({ board: board, player: player });

        var moves = self.getAllValidMoves(board, player);
        return randomElementInArray(moves);
    };
    self.getMoveCornerOrMostFlipped = function (board, player)
    /*
        ->  { x: Int, y: Int, flipped: Int, player: Int }
    */
    {
        self.validate({ board: board, player: player });

        var bestMove = null;
        var moves = self.getAllValidMoves(board, player);
        moves.forEach(function (move) {
            move.isCorner = isCorner(move);
            if (!bestMove) {
                bestMove = move;
                return;
            }
            if (move.isCorner && !bestMove.isCorner) {
                bestMove = move;
                return;
            } else if (!move.isCorner && bestMove.isCorner) {
                return;
            }
            if (move.flipped > bestMove.flipped) {
                bestMove = move;
                return;
            }
            if (move.flipped == bestMove.flipped) {
                bestMove = randomElementInArray([bestMove, move]);
                return;
            }
        });
        delete bestMove.isCorner;
        return bestMove;
    };
    self.makeMove = function (board, move)
    /*
        -> Bool
    */
    {
        self.validate({ board: board, move: move });

        var flipped = self.tilesFlippedOnMove(board, move);
        if (!flipped.length) {
            return false;
        }
        board[move.y][move.x] = move.player;
        flipped.forEach(function (flip) {
            board[flip.y][flip.x] = move.player;
        });
        return true;
    };
    self.getCurrentScore = function (board)
    /*
        ->  [Int, Int, Int] (Not Played, Player 1, Player 2)
    */
    {
        self.validate({ board: board });

        var score = [0, 0, 0];
        for (var y = 0; y < TILES; y++) {
            for (var x = 0; x < TILES; x++) {
                var player = board[y][x];
                score[player]++;
            }
        }
        return score;
    };
    self.checkGameOver = function (board)  
    /*
        ->  0 (Game Not Over), 1 / 2 (Player Won), -1 (Tie),
    */
    {
        self.validate({ board: board });

        var playerOneMoves = self.getAllValidMoves(board, 1).length;
        var playerTwoMoves = self.getAllValidMoves(board, 2).length;
        if (!playerOneMoves && !playerTwoMoves) {
            var score = self.getCurrentScore(board);
            if (score[1] > score[2]) {
                return 1;
            } else if (score[2] > score[1]) {
                return 2;
            } else {
                // Tie Game
                return -1;
            }
        }
        if (!playerOneMoves) {
            return 2;
        }
        if (!playerTwoMoves) {
            return 1;
        }
        return 0;
    };
    self.validate = function(toValidate, args)
    /*
        throws if valid
    */
    {
        if (!args) { args = {}; }
        var error;
        if ("player" in toValidate) {
            error = self.checkPlayerIsValid(toValidate.player, args.player);
            if (error) {
                throw error;
            }
        }
        if ("board" in toValidate) {
            error = self.checkBoardIsValid(toValidate.board, args.board);
            if (error) {
                throw error;
            }
        }
        if ("move" in toValidate) {
            error = self.checkMoveIsValid(toValidate.move, args.move);
            if (error) {
                throw error;
            }
        }
    };
    self.checkBoardIsValid = function (board) 
    /*
        -> err if not Array with 8 Arrays Containing 8 Ints (0, 1, or 2)
    */
    {
        if (!Array.isArray(board) || board.length != TILES) {
            console.log(Array.isArray(board));
            console.log(board.length, TILES);
            return "Board Not Valid";
        }
        for (var x = 0; x < TILES; x++) {
            if (!Array.isArray(board[x]) || board[x].length != TILES) {
                return "Board Not Valid";
            }
            for (var y = 0; y < TILES; y++) {
                var value = board[x][y];
                if (value !== 0 && value !== 1 && value !== 2) {
                    return "Board Not Valid";
                }
            }
        }
    };
    self.checkMoveIsValid = function (move)
    /*
        -> err if not { x: Int, y: Int, player: Int } Where x and y are 0 < 8 and player == 1 or 2
    */
    {
        if (typeof move != "object") {
            return "Invalid Move";
        }
        if (!("x" in move && "y" in move && "player" in move)) {
            return "Invalid Move";
        }
        var x = move.x, y = move.y;
        if (!(isInt(x) && isInt(y))) {
            return "Move Coordinates Not Integers";
        }
        if(x < 0 || y < 0 || x > TILES || y > TILES) {
            return "Move Not Within Bounds";
        }
        if (move.player !== 1 && move.player !== 2) {
            return "Move Does Not Have Valid Player";
        }
    };
    self.checkPlayerIsValid = function (player, canBeZero)
    /*
        -> err if not 1 or 2 (or 0 if okay)
    */
    {
        if (player === 1 || player === 2) {
            return;
        }
        if (canBeZero && player === 0) {
            return;
        }
        return "Invalid Player";
    };
}


//------------ Private Functions ------------//
function isInt(value) {
    if (isNaN(value)) {
        return false;
    }
    var x = parseInt(value);
    return (x | 0) === x;
}
function randomElementInArray(array)
{
    return array[Math.floor(Math.random() * array.length)];
}
function inBounds(tile) 
{
    var x = tile.x, y = tile.y;
    return !(x < 0 || y < 0 || x >= TILES || y >= TILES);
}
function isCorner(tile)
{
    var x = tile.x, y = tile.y;
    var c = TILES - 1;
    return ((x === 0 && y === 0) || (x === 0 && y === c) ||
            (x === c && y === 0) || (x === c && y === c));
}
function increment(tile, direction, reversed) 
{
    var multiplier = (reversed) ? -1 : 1;
    tile.x += direction[0] * multiplier;
    tile.y += direction[1] * multiplier;
}
function checkDirection(board, move, direction)  // -> [{ x: Int, y: Int }]
{
    var flipped = [];
    var tile = {x: move.x, y: move.y};
    var opponent = (move.player % 2) + 1;

    increment(tile, direction);
    if (!inBounds(tile) || board[tile.y][tile.x] != opponent) {
        //  Touching Tile Must Be Opponent
        return flipped;
    }
    increment(tile, direction);
    while(inBounds(tile) && board[tile.y][tile.x] == opponent) {
        // Traverse Down Opponent Tiles Towards Player Tile
        increment(tile, direction);
    }
    if (!inBounds(tile) || board[tile.y][tile.x] != move.player) {
        // End Tile Must Be Player's Tile
        return flipped;
    }
    while (!(tile.x == move.x && tile.y == move.y)) {
        // Traverse Back Up Confirmed Tiles
        increment(tile, direction, "REVERSE");
        flipped.push({ x: tile.x, y: tile.y });
    }
    return flipped;
}

},{}],2:[function(require,module,exports){

module.exports = MainController;

function MainController (Auth, User, Match, $document, $scope)
{
    var self = this;
    self.toggleVisibleGames = false;

    self.refresh = function ()
    {
        Match.refresh();
    };
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

},{}],3:[function(require,module,exports){

module.exports = PixiController;

var globals = require("../globals.js");

function PixiController ($window, $scope, Match)
{
    var canvas = angular.element(document.querySelector("#pixi-canvas"));
    var pixiElement = angular.element(canvas.parent());

    var Game = require("../game/game.js");
    self.game = new Game(canvas[0]);
    addListeners();

    function addListeners ()
    {
        angular.element($window).bind("load", function () {
            resize();
            self.game.start();
        });
        angular.element($window).bind("resize", function () {
            resize();
        });
        self.game.onMove(function (move) {
            Match.makeMove(move)
            .then(function (match) {
                self.game.updateMatch(match);
            })
            .catch(function (err) {
                console.log("Move Not Made:", err);
            });
        });
        Match.on("switched", function (match) {
            self.game.switchMatch(match);
        });
        Match.on("incoming", function (match) {
            self.game.updateMatch(match);
        });
        Match.on("refresh", function (match) {
            if (match) {
                self.game.updateMatch(match);
            }
        });
    }
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
        self.game.resize(d);
    }
}

},{"../game/game.js":10,"../globals.js":11}],4:[function(require,module,exports){

module.exports = SideBarController;

function SideBarController (Auth, User, Match)
{
    var self = this;
    self.open = false;

    Auth.onLogin.push(function () {
        self.update();
    });
    Match.on("shouldMakeMove", function () {
        console.log("Running:", self.open);
        return !self.open;
    });
    self.update = function ()
    {
        self.users = User.users;
        self.matches = Match.matches;
    };
    self.clickedMatch = function (match)
    {
        Match.switchMatch(match._id)
        .then(function () {
            self.open = false;
        });
    };
}

},{}],5:[function(require,module,exports){

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
            controller: "pixiController"
        };
    });
};

},{}],6:[function(require,module,exports){

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


},{}],7:[function(require,module,exports){

module.exports = MatchFactory;

// console.log("Hello");

function MatchFactory ($q, $http, User)
{
    var factory = {};
    factory.matches = [];
    factory.match = null;

    var callbacks = {
        switched: [],
        incoming: [],
        shouldMakeMove: [],
        refresh: []
    };
    factory.on = function (listener, callback)
    {
        if (typeof(callback) === "function" && callbacks[listener]) {
            callbacks[listener].push(callback);
        }
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
            console.log("i:", i, "shouldMakeMove:", shouldMakeMove);
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
                console.log("Success MothaFucka!");
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

},{}],8:[function(require,module,exports){

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
},{}],9:[function(require,module,exports){

var globals = require("../globals.js");

module.exports = Board;

function Board (game)
{
    var self = this;
    self.game = game;
    self.container = new PIXI.Container();

    self.grid = null;
    makeGrid();
    addGridToContainer();

    self.reset = function ()
    {
        console.log("\n\n\nRESETTING\n\n\n");
        eachGridTile(function (tile) {
            tile.mushroom.flip(0);
        });
    };
    self.update = function (grid)
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
        self.grid = [];
        self.grid.tileDiameter = globals.width / 8;

        for (var row = 0; row < 8; row++) {
            self.grid.push([]);

            for (var column = 0; column < 8; column++) {
                var diameter = self.grid.tileDiameter;

                var x = diameter * row;
                var y = diameter * column;

                var tile = { x: x, y: y, row: row, column: column, player: 0 };
                
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
    self.game = game;
    self.tile = tile;
    self.sprite = new PIXI.Sprite();
    initSprite(tile);
    
    self.orientation = 0;

    self.flip = function (player)
    {
        self.orientation = (player === self.game.player) ? 0 : 1;
        
        var prev = self.tile.player;
        self.tile.player = player;
        
        if (!prev) {
            render();
        } else if (prev === player) {
            return;
        } else {
            console.log("Rotating:", prev, self.tile);
            requestAnimationFrame(rotate);
        }
    };

    function render ()
    {
        var rotation = Math.PI * self.orientation;
        self.sprite.rotation = rotation;
        self.sprite.texture = getTextureForPlayer(self.tile.player);
        self.game.render();
    }
    function rotate ()
    {
        var maxRotation;
        if (self.orientation)
            maxRotation = Math.PI;
        else 
            maxRotation = 2 * Math.PI;
        console.log(self.sprite.rotation, maxRotation);
        if (self.sprite.rotation < maxRotation) {
            self.sprite.rotation += 0.08;
            self.game.render();
            requestAnimationFrame(rotate);
        } else {
            render();
        }
    }
    function initSprite(tile) {
        self.sprite.anchor = new PIXI.Point(0.5, 0.5);  // Allow it to rotate around center

        self.sprite.width = diameter;
        self.sprite.height = diameter;

        self.sprite.position.x = tile.x + (diameter * 0.5); // Make up for changed anchor
        self.sprite.position.y = tile.y + (diameter * 0.5);

        self.sprite.interactive = true;
        self.sprite.on('mouseup', mousePress);
        self.sprite.on('touchend', mousePress);
        function mousePress ()
        {
            var move = { x: tile.column, y: tile.row };
            self.game.makeMove(move);
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
                return globals.textures.transparent.texture;
        }
    }
}


},{"../globals.js":11}],10:[function(require,module,exports){

module.exports = Game;

var globals = require("../globals.js");
var colors = globals.colors;
var Board = require("./board.js");
var othelloLogic = require("../../../othello-logic.js");

function Game (canvas)
{
    var self = this;
    self.renderer = new PIXI.autoDetectRenderer(globals.width, globals.width, { view: canvas, transparent: true });
    self.stage = new PIXI.Container();
    self.resources = null;

    self.match = null;
    self.player = 1;  // Temp for Test
    self.logic = othelloLogic;

    self.board = null;


    self.madeMove = [];  // Callbacks Set In Controller
    self.onMove = function (callback)
    {
        if (typeof(callback) === "function") {
            self.madeMove.push(callback);
        }
    };
    self.makeMove = function (move)
    {
        if (!self.match) { return; }
        move.player = self.player;
        var board = JSON.parse(self.match.board);
        var valid;
        try {
            valid = Boolean(self.logic.tilesFlippedOnMove(board, move).length);
        } catch (err) {
            console.log(err, board);
        }
        if (valid) {
            self.match.turn = null;
            self.madeMove.forEach(function (callback) {
                callback(move);
            });
        }
    };
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
            self.board = new Board(self);
            self.stage.addChild(self.board.container);
            self.render();
        });
    };
    self.switchMatch = function (match)
    {
        if (!self.match || self.match._id != match._id) {
            self.board.reset();
        }
        self.match = match;
        update();
    };
    self.updateMatch = function (match)
    {
        if (!self.match || self.match._id != match._id) {
            console.log("Incoming Match, Not Current:", match);
            return;
        }
        if (self.match.updatedAt == match.updatedAt) {
            console.log("Unchanged Match");
            return;
        }
        self.match = match;
        update();
    };
    function update ()
    {
        console.log(self.match);
        var grid = JSON.parse(self.match.board);
        self.board.update(grid);
    }
    self.render = function ()
    {
        self.renderer.render(self.stage);
    };
}


},{"../../../othello-logic.js":1,"../globals.js":11,"./board.js":9}],11:[function(require,module,exports){

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
            .add("transparent", "images/transparent.png")
            .load(function (loader, resources) {
                self.textures = resources;
                resolve();
            });
        });
        return promise;
    };
}

},{}],12:[function(require,module,exports){

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
.controller("pixiController", [
    "$window", "$scope", "matchFactory",
    require("./controllers/pixi-controller")
])
.controller("mainController", [
    "authenticationFactory", "userFactory", "matchFactory", "$document", "$scope", 
    require("./controllers/main-controller")
]);

require("./directives.js")(othelloModule);

},{"./controllers/main-controller":2,"./controllers/pixi-controller":3,"./controllers/sidebar-controller":4,"./directives.js":5,"./factories/authentication-factory":6,"./factories/match-factory":7,"./factories/user-factory":8}]},{},[12]);

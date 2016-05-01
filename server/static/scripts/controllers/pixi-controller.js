
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
            if (self.game.match) {
                var id = self.game.match._id;
                if (id) { Match.unsubscribe(id); }
            }
            self.game.switchMatch(match);
            Match.subscribe(function (match) {
                self.game.updateMatch(match);
            });
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

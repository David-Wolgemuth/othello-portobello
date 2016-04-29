
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

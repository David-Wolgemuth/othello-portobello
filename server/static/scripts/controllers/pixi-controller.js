
module.exports = PixiController;

function PixiController ($window, $scope)
{
    // You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
    // which will try to choose the best renderer for the environment you are in.

    var canvas = angular.element(document.querySelector("#pixi-canvas"));
    var pixiElement = angular.element(canvas.parent());
    console.log(pixiElement);

    var GameSetup = require("../game/game-setup.js");
    var game = new GameSetup(canvas[0]);
    game.start();

    angular.element($window).bind("resize load", function () {
        resize();
    });
    function resize ()
    {
        console.log("Resizing");
        var width = $window.innerWidth;
        var height = $window.innerHeight;

        var hamburger = 36;

        var w;
        if (width < height - hamburger) {
            w = width;
            pixiElement.css("left", 0);
        } else {
            w = height - hamburger;
            var x = (width - (w)) / 2;
            pixiElement.css("left", x + "px");
        }
        game.renderer.resize(w, w);

        // var scale = w / game.WIDTH;
        // var stage = game.stage;
        // stage.scale.x = scale; stage.scale.y = stage;
        // console.log(stage);
    }

    
}


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

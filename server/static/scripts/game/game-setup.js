
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


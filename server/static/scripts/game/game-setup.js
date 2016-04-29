
module.exports = GameSetup;

var globals = require("../globals.js");
var colors = globals.colors;

function GameSetup (canvas)
{
    var self = this;
    // self.WIDTH = WIDTH;
    self.renderer = new PIXI.autoDetectRenderer(globals.width, globals.width, { view: canvas, transparent: true });
    self.stage = new PIXI.Container();
    self.resources = null;

    self.start = function ()
    {
        self.backgroundColor = colors.white;
        globals.load()
        .then(function() {
            var board = self.makeBoard();
            self.stage.addChild(board);
            self.renderer.render(self.stage);
        });
    };
    self.makeBoard = function ()
    {
        var grid = new PIXI.Container();
        var mushrooms = new PIXI.Container();

        var graphics = new PIXI.Graphics();
        graphics.beginFill(colors.olive);
        graphics.lineStyle(4, colors.brown);
        var d = globals.width / 8;
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                var x = d * i;
                var y = d * j;
                graphics.drawRect(x, y, d, d);
                var mushroom = self.makeMushroom(x, y, d);
                mushrooms.addChild(mushroom);
            }
        }
        grid.addChild(graphics);
        grid.addChild(mushrooms);
        return grid;
    };
    self.makeMushroom = function (x, y, d)
    {
        var mushroom = new PIXI.Sprite(globals.textures.mushroom.texture);
        mushroom.width = d;
        mushroom.height = d;
        mushroom.position.x = x;
        mushroom.position.y = y;
        return mushroom;
    };
}


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


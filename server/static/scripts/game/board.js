
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


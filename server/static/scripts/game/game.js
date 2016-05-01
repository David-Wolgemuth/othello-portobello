
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


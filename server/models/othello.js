/*****
    Othello
        .makeEmptyBoard = function ()
            ->  [[0, 0, ...],  ...]
        .tilesFlippedOnMove = function (board, move)
            ->  [{ x: Int, y: Int }]
        .getAllValidMoves = function (board, player)
            ->  [{ x: Int, y: Int, flipped: Int, player: Int }]
        .getRandomMove = function (board, player)
            ->  { x: Int, y: Int, flipped: Int, player: Int }
        .getMoveCornerOrMostFlipped = function (board, player)
            ->  { x: Int, y: Int, flipped: Int, player: Int }
        .makeMove = function (board, move, player)
            ->  Bool
        .getCurrentScore = function (board)
            ->  [Int, Int, Int] (Not Played, Player 1, Player 2)
        .checkGameOver = function (board)  
            ->  0 (Game Not Over), 1 / 2 (Player Won), -1 (Tie)
*/
var validations = require("./othello-validations");
validate = function (toValidate, args)
{
    if (!args) { args = {}; }
    if ("player" in toValidate) {
        validations.checkPlayerIsValid(toValidate.player, args.player);
    }
    if ("board" in toValidate) {
        validations.checkBoardIsValid(toValidate.board, args.board);
    }
    if ("move" in toValidate) {
        validations.checkMoveIsValid(toValidate.move, args.move);
    }
};


//------------ Constants -------------//

var TILES = 8;
var DIRECTIONS = [
    [0, 1], [1, 1], [1, 0], [1, -1], 
    [0, -1], [-1, -1], [-1, 0], [-1, 1]
];

//------------ Private Functions ------------//

function randomElementInArray(array)
{
    return array[Math.floor(Math.random() * array.length)];
}
function inBounds(tile) 
{
    var x = tile.x, y = tile.y;
    return !(x < 0 || y < 0 || x > TILES || y > TILES);
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
    if (!(inBounds(tile) && board[tile.y][tile.x] == opponent)) {
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


module.exports = (function () 
{
    //------------ Othello Object + Methods -------------//

    var Othello = {};
    Othello.makeEmptyBoard = function ()
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
    Othello.tilesFlippedOnMove = function (board, move)
    /* 
        ->  [{ x: Int, y: Int }]
    */
    {
        validate({ board: board, move: move });

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
    Othello.getAllValidMoves = function (board, player)
    /*
        ->  [{ x: Int, y: Int, flipped: Int, player: Int }]
    */
    {
        validate({ board: board, player: player });

        var moves = [];
        if (!player) {  // Game Over
            return moves;
        }
        for (var x = 0; x < TILES; x++) {
            for (var y = 0; y < TILES; y++) {
                var move = { x: x, y: y, player: player };
                move.flipped = Othello.tilesFlippedOnMove(board, move).length;
                if (move.flipped) {
                    moves.push(move);
                } 
            }
        }
        return moves;
    };
    Othello.getRandomMove = function (board, player)
    /*
        ->  { x: Int, y: Int, flipped: Int, player: Int }
    */
    {
        validate({ board: board, player: player });

        var moves = Othello.getAllValidMoves(board, player);
        return randomElementInArray(moves);
    };
    Othello.getMoveCornerOrMostFlipped = function (board, player)
    /*
        ->  { x: Int, y: Int, flipped: Int, player: Int }
    */
    {
        validate({ board: board, player: player });

        var bestMove = null;
        var moves = Othello.getAllValidMoves(board, player);
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
    Othello.makeMove = function (board, move)
    /*
        -> Bool
    */
    {
        validate({ board: board, move: move });

        var flipped = Othello.tilesFlippedOnMove(board, move);
        if (!flipped.length) {
            return false;
        }
        board[move.y][move.x] = move.player;
        flipped.forEach(function (flip) {
            board[flip.y][flip.x] = move.player;
        });
        return true;
    };
    Othello.getCurrentScore = function (board)
    /*
        ->  [Int, Int, Int] (Not Played, Player 1, Player 2)
    */
    {
        validate({ board: board });

        var score = [0, 0, 0];
        for (var y = 0; y < TILES; y++) {
            for (var x = 0; x < TILES; x++) {
                var player = board[y][x];
                score[player]++;
            }
        }
        return score;
    };
    Othello.checkGameOver = function (board)  
    /*
        ->  0 (Game Not Over), 1 / 2 (Player Won), -1 (Tie),
    */
    {
        validate({ board: board });

        var playerOneMoves = Othello.getAllValidMoves(board, 1).length;
        var playerTwoMoves = Othello.getAllValidMoves(board, 2).length;
        if (!playerOneMoves && !playerTwoMoves) {
            var score = Othello.getCurrentScore(board);
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
    return Othello;

}) (); 

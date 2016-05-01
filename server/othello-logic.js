/*****
    Othello Game
*/

module.exports = new OthelloLogic();

//------------ Constants -------------//

var TILES = 8;
var DIRECTIONS = [
    [0, 1], [1, 1], [1, 0], [1, -1], 
    [0, -1], [-1, -1], [-1, 0], [-1, 1]
];

//------------ Othello Object + Methods -------------//

function OthelloLogic() {
    var self = this;
    
    self.makeEmptyBoard = function ()
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
    self.tilesFlippedOnMove = function (board, move)
    /* 
        ->  [{ x: Int, y: Int }]
    */
    {
        self.validate({ board: board, move: move });

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
    self.getAllValidMoves = function (board, player)
    /*
        ->  [{ x: Int, y: Int, flipped: Int, player: Int }]
    */
    {
        self.validate({ board: board, player: player });

        var moves = [];
        if (!player) {  // Game Over
            return moves;
        }
        for (var x = 0; x < TILES; x++) {
            for (var y = 0; y < TILES; y++) {
                var move = { x: x, y: y, player: player };
                move.flipped = self.tilesFlippedOnMove(board, move).length;
                if (move.flipped) {
                    moves.push(move);
                } 
            }
        }
        return moves;
    };
    self.getRandomMove = function (board, player)
    /*
        ->  { x: Int, y: Int, flipped: Int, player: Int }
    */
    {
        self.validate({ board: board, player: player });

        var moves = self.getAllValidMoves(board, player);
        return randomElementInArray(moves);
    };
    self.getMoveCornerOrMostFlipped = function (board, player)
    /*
        ->  { x: Int, y: Int, flipped: Int, player: Int }
    */
    {
        self.validate({ board: board, player: player });

        var bestMove = null;
        var moves = self.getAllValidMoves(board, player);
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
    self.makeMove = function (board, move)
    /*
        -> Bool
    */
    {
        self.validate({ board: board, move: move });

        var flipped = self.tilesFlippedOnMove(board, move);
        if (!flipped.length) {
            return false;
        }
        board[move.y][move.x] = move.player;
        flipped.forEach(function (flip) {
            board[flip.y][flip.x] = move.player;
        });
        return true;
    };
    self.getCurrentScore = function (board)
    /*
        ->  [Int, Int, Int] (Not Played, Player 1, Player 2)
    */
    {
        self.validate({ board: board });

        var score = [0, 0, 0];
        for (var y = 0; y < TILES; y++) {
            for (var x = 0; x < TILES; x++) {
                var player = board[y][x];
                score[player]++;
            }
        }
        return score;
    };
    self.checkGameOver = function (board)  
    /*
        ->  0 (Game Not Over), 1 / 2 (Player Won), -1 (Tie),
    */
    {
        self.validate({ board: board });

        var playerOneMoves = self.getAllValidMoves(board, 1).length;
        var playerTwoMoves = self.getAllValidMoves(board, 2).length;
        if (!playerOneMoves && !playerTwoMoves) {
            var score = self.getCurrentScore(board);
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
    self.validate = function(toValidate, args)
    /*
        throws if valid
    */
    {
        if (!args) { args = {}; }
        var error;
        if ("player" in toValidate) {
            error = self.checkPlayerIsValid(toValidate.player, args.player);
            if (error) {
                throw error;
            }
        }
        if ("board" in toValidate) {
            error = self.checkBoardIsValid(toValidate.board, args.board);
            if (error) {
                throw error;
            }
        }
        if ("move" in toValidate) {
            error = self.checkMoveIsValid(toValidate.move, args.move);
            if (error) {
                throw error;
            }
        }
    };
    self.checkBoardIsValid = function (board) 
    /*
        -> err if not Array with 8 Arrays Containing 8 Ints (0, 1, or 2)
    */
    {
        if (!Array.isArray(board) || board.length != TILES) {
            console.log(Array.isArray(board));
            console.log(board.length, TILES);
            return "Board Not Valid";
        }
        for (var x = 0; x < TILES; x++) {
            if (!Array.isArray(board[x]) || board[x].length != TILES) {
                return "Board Not Valid";
            }
            for (var y = 0; y < TILES; y++) {
                var value = board[x][y];
                if (value !== 0 && value !== 1 && value !== 2) {
                    return "Board Not Valid";
                }
            }
        }
    };
    self.checkMoveIsValid = function (move)
    /*
        -> err if not { x: Int, y: Int, player: Int } Where x and y are 0 < 8 and player == 1 or 2
    */
    {
        if (typeof move != "object") {
            return "Invalid Move";
        }
        if (!("x" in move && "y" in move && "player" in move)) {
            return "Invalid Move";
        }
        var x = move.x, y = move.y;
        if (!(isInt(x) && isInt(y))) {
            return "Move Coordinates Not Integers";
        }
        if(x < 0 || y < 0 || x > TILES || y > TILES) {
            return "Move Not Within Bounds";
        }
        if (move.player !== 1 && move.player !== 2) {
            return "Move Does Not Have Valid Player";
        }
    };
    self.checkPlayerIsValid = function (player, canBeZero)
    /*
        -> err if not 1 or 2 (or 0 if okay)
    */
    {
        if (player === 1 || player === 2) {
            return;
        }
        if (canBeZero && player === 0) {
            return;
        }
        return "Invalid Player";
    };
}


//------------ Private Functions ------------//
function isInt(value) {
    if (isNaN(value)) {
        return false;
    }
    var x = parseInt(value);
    return (x | 0) === x;
}
function randomElementInArray(array)
{
    return array[Math.floor(Math.random() * array.length)];
}
function inBounds(tile) 
{
    var x = tile.x, y = tile.y;
    return !(x < 0 || y < 0 || x >= TILES || y >= TILES);
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
    if (!inBounds(tile) || board[tile.y][tile.x] != opponent) {
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

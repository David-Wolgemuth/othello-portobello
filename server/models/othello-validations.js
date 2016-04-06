/*****
    Othello Game Validations
*/

var TILES = 8;
function isInt(value) {
    if (isNaN(value)) {
        return false;
    }
    var x = parseInt(value);
    return (x | 0) === x;
}

module.exports = (function () {

    var Validations = {};
    Validations.checkBoardIsValid = function (board) 
    /*
        Throws if not Array with 8 Arrays Containing 8 Ints (0, 1, or 2)
    */
    {
        if (!Array.isArray(board) || board.length != TILES) {
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
    Validations.checkMoveIsValid = function (move)
    /*
        Throws if not { x: Int, y: Int, player: Int } Where x and y are 0 < 8 and player == 1 or 2
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
    Validations.checkPlayerIsValid = function (player, canBeZero)
    /*
        Throws if not 1 or 2 (or 0 if okay)
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

    return Validations;

}) ();

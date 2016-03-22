/*****
    Validations
        .checkBoardIsValid
        .checkMoveIsValid
        checkPlayerIsValid

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
            throw "Board Not Valid";
        }
        for (var x = 0; x < TILES; x++) {
            if (!Array.isArray(board[x]) || board[x].length != TILES) {
                throw "Board Not Valid";
            }
            for (var y = 0; y < TILES; y++) {
                var value = board[x][y];
                if (value !== 0 && value !== 1 && value !== 2) {
                    throw "Board Not Valid";
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
            throw "Invalid Move";
        }
        if (!("x" in move && "y" in move && "player" in move)) {
            throw "Invalid Move";
        }
        var x = move.x, y = move.y;
        if (!(isInt(x) && isInt(y))) {
            throw "Move Coordinates Not Integers";
        }
        if(x < 0 || y < 0 || x > TILES || y > TILES) {
            throw "Move Not Within Bounds";
        }
        if (move.player !== 1 && move.player !== 2) {
            throw "Move Does Not Have Valid Player";
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
        throw "Invalid Player";
    };

    return Validations;

}) ();

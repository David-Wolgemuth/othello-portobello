// Othello Spec

var othello = require("../othello/othello.js");
var validations = require("../othello/othello-validations.js");

describe("Othello.makeEmptyBoard()", function () {
    it("should make a valid empty board", function () {
        var board = othello.makeEmptyBoard();
        validations.checkBoardIsValid(board);
    });
});

describe("Othello.checkGameOver()", function () {
    it("should not accept invalid board", function () {
        expect(function () {
            othello.checkGameOver([[1, 2], [3, 4]]);
        }).toThrow(new Error("Board Not Valid"));
    });
});

describe("Othello.makeMove()", function () {
    it("should place player in appropriate location", function () {
        var board = othello.makeEmptyBoard();
        var move = { x: 2, y: 3, player: 2 };
        othello.makeMove(board, move);
        expect(board[move.x][move.y]).toEqual(move.player);
    });
    it("should return appropriate boolean", function () {
        var board = othello.makeEmptyBoard();
        var move = { x: 2, y: 3, player: 2 };
        var first = othello.makeMove(board, move);
        var second = othello.makeMove(board, move);
        expect(first).toEqual(true);
        expect(second).toEqual(false);
    });
});

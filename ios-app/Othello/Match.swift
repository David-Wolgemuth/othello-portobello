//
//  Match.swift
//  Othello
//
//  Created by David Wolgemuth on 4/14/16.
//  Copyright © 2016 David. All rights reserved.
//

import SwiftyJSON

class Turn
{
    var row: Int!
    var column: Int!
    var player: Int!
    init(row r: Int, column c: Int, player p: Int)
    {
        row = r
        column = c
        player = p
    }
}

class Board
{
    var string: String
    var rows = [[Int]]()
    init(string str: String, success: (Board) -> (), failure: failureClosure?)
    {
        string = str
        update(success, failure: failure)
    }
    func playerAtRow(row: Int, andColumn col: Int) -> Int
    {
        return rows[row][col]
    }
    func update(success: (Board) -> (), failure: failureClosure?)
    {
        if let data = string.dataUsingEncoding(NSUTF8StringEncoding) {
            let json = JSON(data: data)
            if let board = json.array {
                rows.removeAll()
                for y in 0..<board.count {
                    rows.append([])
                    let row = board[y].array!
                    for x in 0..<row.count {
                        rows[y].append(row[x].int!)
                    }
                }
            } else {
                failure?(message: "Failure To Update Board (could not retrieve array from json)", code: 0)
                return
            }
        } else {
            failure?(message: "Failure to Convert Data to JSON", code: 0)
            return
        }
        success(self)
    }
    func update(string str: String, success: (Board) -> (), failure: failureClosure?)
    {
        string = str
        update(success, failure: failure)
    }
}

class Match
{
    var id: String!
    var winner: Int!
    var turn: Int!
    var board: Board!
    var players = [User]()
    var validTurns = [Turn]()
    
    init(matchJSON: [String: JSON], success: (Match) -> (), failure: failureClosure?)
    {
        parseOriginalJSON(matchJSON, success: success, failure: failure)
    }
    init(matchId: String, success: (Match) -> (), failure: failureClosure?)
    {
        Requests.getMatchById(id, success: { match in
            self.parseOriginalJSON(match, success: success, failure: failure)
        }, failure: failure)
    }
    init(opponent: User, failure: failureClosure?)
    {
        Requests.getMatchByUserId(opponent.id, success: { match in
            
        }, failure: failure)
    }
    func update(withJSON json: [String: JSON], success: (Match) -> (), failure: failureClosure?)
    {
        parseUpdatedJSON(json, success: success, failure: failure)
    }
    func parseOriginalJSON(match: [String: JSON], success: (Match) -> (), failure: failureClosure?)
    {
        if let id = match["_id"]?.string {
            self.id = id
        } else {
            parseFailure(failure); return
        }
        if let playersStringArray = match["players"]?.array {
            if playersStringArray.count > 0 {
                let p1 = User(id: playersStringArray[0].string!, success: {}, failure: failure)
                self.players.append(p1)
            }
            if playersStringArray.count > 1 {
                let p2 = User(id: playersStringArray[1].string!, success: {}, failure: failure)
                self.players.append(p2)
            } else {
                if let ai = match["ai"]?.string {
                    switch ai {
                    case "easy_ai":
                        self.players.append(User.easyAI)
                        break
                    case "normal_ai":
                        self.players.append(User.normalAI)
                    default:
                        failure?(message: "No Opponent Found In Match", code: 0)
                        break
                    }
                }
            }
        }
        parseUpdatedJSON(match, success: success, failure: failure)
    }
    func parseUpdatedJSON(match: [String: JSON], success: (Match) -> (), failure: failureClosure?)
    {
        if let winner = match["winner"]?.int {
            self.winner = winner
        } else {
            parseFailure(failure); return
        }
        if let turn = match["turn"]?.int {
            self.turn = turn
        } else {
            parseFailure(failure); return
        }
        if let boardString = match["board"]?.string {
            let _ = Board(string: boardString, success: {
                board in
                self.board = board
                success(self)
            } , failure: failure)
        } else {
            parseFailure(failure); return
        }
    }
}

func parseFailure(failure: failureClosure?)
{
    failure?(message: "Unable To Parse Match JSON", code: 0)
}
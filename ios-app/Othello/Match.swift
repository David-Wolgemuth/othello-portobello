//
//  Match.swift
//  Othello
//
//  Created by David Wolgemuth on 4/14/16.
//  Copyright © 2016 David. All rights reserved.
//

import SwiftyJSON

class Match
{
    var id: String!
    var winner: Int!
    var turn: Int!
    var board: [[Int]]!
    var players: [User]!
    
    init(opponentId: String, failure: failureClosure?)
    {
        
    }
    init(matchId: String, failure: failureClosure?)
    {
        Requests.getMatchById(id, success: { match in
            self.update(match, failure: failure)
        }, failure: failure)
    }
    init(opponent: User, failure: failureClosure?)
    {
        Requests.getMatchByUserId(opponent.id, success: { match in
            
        }, failure: failure)
    }
    func update(success: () -> (), failure: failureClosure?)
    {
        
    }
    func update(match: [String: JSON], failure: failureClosure?)
    {
        id = match["id"]?.string
        winner = match["winner"]?.int
        turn = match["turn"]?.int
        
        if players.count == 0 {
            if let _players = match["players"]?.array {
                for _player in _players {
                    if _player.string == User.player.id {
                        players.append(User.player)
                    } else {
                        if let id = _player.string {
                            Requests.getUserById(id, success: { user in }, failure: failure)
                        }
                    }
                }
            }
        }
    }
    static func parseJSON(match: [String: JSON], success: () -> (), failure: failureClosure?)
    {
        if id != match["id"]?.string {
            failure?(message: "Match IDs Do Not Match", code: 0)
            return
        }
        
        
        
    }
}

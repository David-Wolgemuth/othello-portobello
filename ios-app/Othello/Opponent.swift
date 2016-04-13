//
//  Opponent.swift
//  Othello
//
//  Created by David Wolgemuth on 3/30/16.
//  Copyright © 2016 David. All rights reserved.
//

import Foundation
import SwiftyJSON

enum OpponentType
{
    case AI
    case Friend
    case NonFriend
}
enum ImageSize: String
{
    case Small = "small"
    case Normal = "normal"
    case Large = "large"
}
class Opponent
{
    let id: String
    let fbid: String
    let name: String
    var type: OpponentType
    var names: (first: String?, middle: String?, last: String?)
    
    static let easyAI = Opponent(id: "easy_ai", fbid: "", name: "AI (easy)", type: .AI)
    static let normalAI = Opponent(id: "normal_ai", fbid: "", name: "AI (normal)", type: .AI)
    
    init(id: String, fbid: String, name: String, type: OpponentType)
    {
        self.id = id
        self.fbid = fbid
        self.name = name
        self.type = type
        splitName(name)
    }
    private func splitName(unsplit: String)
    {
        let arr = unsplit.componentsSeparatedByString(" ")
        switch arr.count {
        case 1:
            names.first = arr[0]
        case 2:
            names.first = arr[0]
            names.last = arr[1]
        case 3:
            names.first = arr[0]
            names.middle = arr[1]
            names.last = arr[2]
        default:
            return
        }
    }
    func getImageURL(size size: ImageSize) -> String
    {
        if type == .AI {
            return "\(id).png"
        }
        return "https://graph.facebook.com/\(fbid)/picture?type=\(size.rawValue)"
    }
    static func getAllUsersAsOpponent(success success: (opponents: [Opponent]) -> (), failure: (String, Int) -> ()?)
    {
        func extract(users: [JSON])
        {
            var opponents = [Opponent]()
            for user in users {
                let name = user["name"].string
                let id = user["_id"].string
                let fbid = user["fbid"].string
                if name == nil || id == nil || fbid == nil {
                    continue
                }
                if fbid == FBSDKAccessToken.currentAccessToken().userID {
                    continue
                }
                let opponent = Opponent(id: id!, fbid: fbid!, name: name!, type: .NonFriend)
                opponents.append(opponent)
            }
            success(opponents: opponents)
        }
        Requests.getAllUsers(success: extract, failure: failure)
    }
    static func getAllOpponents(success success: (opponents: [Opponent]) -> (), failure: (String, Int) -> ()?)
    {
        func getFriends(opps: [Opponent])
        {
            var opponents = opps
            opponents.append(self.easyAI)
            opponents.append(self.normalAI)
            func setFriends(friends: [JSON])
            {
                for opponent in opponents {
                    for friend in friends {
                        if opponent.fbid == friend["id"].string {
                            opponent.type = .Friend
                            break
                        }
                    }
                }
                success(opponents: opponents)
            }
            Requests.getAllFriends(success: setFriends, failure: failure)
        }
        getAllUsersAsOpponent(success: getFriends, failure: failure)
    }
    
}
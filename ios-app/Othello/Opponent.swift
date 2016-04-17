//
//  User.swift
//  Othello
//
//  Created by David Wolgemuth on 3/30/16.
//  Copyright © 2016 David. All rights reserved.
//

import Foundation
import SwiftyJSON

enum UserType
{
    case AI
    case Friend
    case NonFriend
    case Player
}
enum ImageSize: String
{
    case Small = "small"
    case Normal = "normal"
    case Large = "large"
}
class User
{
    var id: String!
    var fbid: String!
    var name: String!
    var type: UserType!
    var names: (first: String?, middle: String?, last: String?)
    
    static let player = User()
    
    static let easyAI = User(id: "easy_ai", fbid: "", name: "AI (easy)", type: .AI)
    static let normalAI = User(id: "normal_ai", fbid: "", name: "AI (normal)", type: .AI)
    
    init()
    {
        
    }
    init(id: String, fbid: String, name: String, type: UserType)
    {
        self.id = id
        self.fbid = fbid
        self.name = name
        self.type = type
        splitName(name)
    }
    init(id: String, success: () -> (), failure: failureClosure?)
    {
        Requests.getUserById(id, success: { user in
            User.parseUser(user, success: { id, fbid, name in
                self.id = id
                self.fbid = fbid
                self.name = name
                self.splitName(name)
            }, failure: failure)
        }, failure: failure)
    }
    static func parseUser(user: [String: JSON], success: (id: String, fbid: String, name: String) -> (), failure: failureClosure?)
    {
        let id = user["_id"]?.string
        let fbid = user["fbid"]?.string
        let name = user["name"]?.string
        if id == nil || fbid == nil || name == nil {
            failure?(message: "User Object Did Not Have Required Keys", code: 0)
        } else {
            success(id: id!, fbid: fbid!, name: name!)
        }
    }
    static func setPlayer(user: [String: JSON], success: () -> (), failure: failureClosure?)
    {
        User.parseUser(user, success: { id, fbid, name in
            self.player.id = id
            self.player.fbid = fbid
            self.player.name = name
            self.player.splitName(name)
            self.player.type = .Player
        }, failure: failure)
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
    static func getAllUsersAsUser(success success: (opponents: [User]) -> (), failure: failureClosure?)
    {
        func extract(users: [JSON])
        {
            var opponents = [User]()
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
                let opponent = User(id: id!, fbid: fbid!, name: name!, type: .NonFriend)
                opponents.append(opponent)
            }
            success(opponents: opponents)
        }
        Requests.getAllUsers(success: extract, failure: failure)
    }
    static func getAllUsers(success success: (opponents: [User]) -> (), failure: failureClosure?)
    {
        func getFriends(opps: [User])
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
        getAllUsersAsUser(success: getFriends, failure: failure)
    }
    
}
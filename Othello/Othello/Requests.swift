//
//  Requests.swift
//  Othello
//
//  Created by David Wolgemuth on 3/29/16.
//  Copyright © 2016 David. All rights reserved.
//

import Foundation
import Alamofire
import SwiftyJSON


class Requests
{
    static let HOST_SITE = NSProcessInfo.processInfo().environment["HOST_SITE"]!
    static let host = HOST_SITE

    static var token = FBSDKAccessToken.currentAccessToken()
    
    static func getDefaultHeaders() -> [String: String]?
    {
        if let xAuthToken = token.tokenString {
           return ["x-auth-token": xAuthToken]
        }
        return nil
    }
    static func standardRequest(method: Alamofire.Method = .GET, url: String, params: [String: String] = [:], success: (JSON) -> (), failure: (message: String, code: Int) -> ()?)
    {
        if let headers = getDefaultHeaders() {
            Alamofire
            .request(method, url, headers: headers, parameters: params, encoding: .JSON)
            .responseJSON { response in
                switch response.result {
                case .Failure(let error):
                    print("Error: \(error)")
                    failure(message: error.description, code: error.code)
                case .Success(let data):
                    let json = JSON(data)
                    if let status = response.response?.statusCode {
                        if status != 200 {
                            var message = "Status Code \(status): "
                            if let m = json["message"].string {
                                message += m
                            } else {
                                message += "No Error Message From Server"
                            }
                            print(message)
                            failure(message: message, code: status)
                        } else {
                            success(json)
                        }
                    } else {
                        let message = "No Response From Server"
                        print(message)
                        failure(message: message, code: 0)
                    }
                }
            }
        } else {
            let message = "Headers Could Not Be Set -> Is User Logged In With Facebook?"
            print(message)
            failure(message: message, code: 0)
        }
    }
    static func checkUserExistsInServer(success: (JSON) -> (), failure: (String, Int) -> ()?)
    {
        let url = "\(host)/users/me"
        standardRequest(url: url, success: success, failure: failure)
    }
    static func getUserFromFB(success: (user: [String:JSON]) -> (), failure: (String, Int) -> ()?)
    {
        let graphRequest = FBSDKGraphRequest(graphPath: "me", parameters: ["fields": "id, name"])
        graphRequest.startWithCompletionHandler { connection, result, error in
            if let err = error {
                let message = err.description
                print(message)
                failure(message, 0)
            } else {
                if let user = result as? [String:String] {
                    createUserIfNotExists(user, success: success, failure: failure)
                } else {
                    let message = "Could Not Extract User Object From Facebook"
                    print(message)
                    failure(message, 0)
                }
            }
        }
    }
    static func createUserIfNotExists(user: [String:String], success: (user: [String:JSON]) -> (), failure: (String, Int) -> ()?)
    {
        func extract(json: JSON)
        {
            if let user = json["data"].dictionary {
                success(user: user)
            } else {
                let message = "Could Not Extract User Object"
                print(message)
                failure(message, 0)
            }
        }
        func createUser(message: String, code: Int)
        {
            if code == 404 {  // User Not Found
                let url = "\(host)/users"
                standardRequest(.POST, url: url, params: user, success: extract, failure: failure)
            }
        }
        getUser(success, failure: createUser)
    }
    static func getUser(success: (user: [String: JSON]) -> (), failure: (String, Int) -> ()?)
    {
        let url = host + "/users/" + token.userID
        func extract(json: JSON)
        {
            if let user = json["user"].dictionary {
                success(user: user)
            } else {
                let message = "Could Not Extract User Object"
                print(message)
                failure(message, 2)
            }
        }
        standardRequest(url: url, success: extract, failure: failure)
    }
    static func getAllUsers(success: (users: [JSON]) -> (), failure: (String, Int) -> ()?)
    {
        let url = host + "/users"
        func extract(json: JSON)
        {
            if let users = json["users"].array {
                success(users: users)
            } else {
                let message = "Could Not Extract Users Array"
                print(message)
                failure(message, 0)
            }
        }
        standardRequest(url: url, success: extract, failure: failure)
    }
    static func getAllFriends(success: (friends: [JSON]) -> (), failure: (String, Int) -> ()?)
    {
        if token == nil {
            failure("Token Nil -> Is User Logged In With Facebook?", 0)
        }
        let url = "https://graph.facebook.com/me/friends?access_token=\(token.tokenString!)"
        func extract(json: JSON)
        {
            if let friends = json["data"].array {
                success(friends: friends)
            } else {
                let message = "Could Not Extract Friends Array"
                print(message)
                failure(message, 0)
            }
        }
        standardRequest(url: url, success: extract, failure: failure)
    }
    static func getOpponentStats(id: String, success: (stats: [String: JSON]) -> (), failure: (String, Int) -> ()?)
    {
        let url = "\(host)/users/me?stats=\(id)"
        func extract(json: JSON)
        {
            if let stats = json["stats"].dictionary {
                success(stats: stats)
            } else {
                let message = "Could Not Extract Stats Object"
                print(message)
                failure(message, 0)
            }
        }
        standardRequest(url: url, success: extract, failure: failure)
    }
    static func startNewMatchWithOpponent(opponentId: String, success: (match: [String:JSON]) -> (), failure: (String, Int) -> ())
    {
        func extract(json: JSON)
        {
            if let match = json["match"].dictionary {
                success(match: match)
            } else {
                let message = "Could Not Extract Match Object"
                print(message)
                failure(message, 0)
            }
        }
        let url = "\(host)/matches"
        let params = [ "opponentId": opponentId ]
        standardRequest(.POST, url: url, params: params, success: extract, failure: failure)
    }
}
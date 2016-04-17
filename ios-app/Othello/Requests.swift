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

typealias failureClosure = (message: String, code: Int) -> ()

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
    static func standardRequest(method: Alamofire.Method, url: String, params: [String: String]?, success: (JSON) -> (), failure: failureClosure?)
    {
        if let headers = getDefaultHeaders() {
            Alamofire
            .request(method, url, headers: headers, parameters: params, encoding: .JSON)
            .responseJSON { response in
                switch response.result {
                case .Failure(let error):
                    print("Error: \(error)")
                    failure?(message: error.description, code: error.code)
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
                            failure?(message: message, code: status)
                        } else {
                            success(json)
                        }
                    } else {
                        let message = "No Response From Server"
                        print(message)
                        failure?(message: message, code: 0)
                    }
                }
            }
        } else {
            let message = "Headers Could Not Be Set -> Is User Logged In With Facebook?"
            print(message)
            failure?(message: message, code: 0)
        }
    }
    static func getUserFromFB(success success: (user: [String:JSON]) -> (), failure: failureClosure?)
    {
        let graphRequest = FBSDKGraphRequest(graphPath: "me", parameters: ["fields": "id, name"])
        graphRequest.startWithCompletionHandler { connection, result, error in
            if let err = error {
                let message = err.description
                print(message)
                failure?(message: message, code: 0)
            } else {
                if let user = result as? [String:String] {
                    self.createUserIfNotExists(user, success: success, failure: failure)
                } else {
                    let message = "Could Not Extract User Object From Facebook"
                    print(message)
                    failure?(message: message, code: 0)
                }
            }
        }
    }
    static func createUserIfNotExists(user: [String:String], success: (user: [String:JSON]) -> (), failure: failureClosure?)
    {
        func extract(json: JSON)
        {
           extractUser(json, success: success, failure: failure)
        }
        func createUser(message: String, code: Int)
        {
            if code == 404 {  // User Not Found
                let url = "\(host)/users"
                standardRequest(.POST, url: url, params: user, success: extract, failure: failure)
            }
        }
        getUser(success: success, failure: createUser)
    }
    static func getUser(success success: (user: [String: JSON]) -> (), failure: failureClosure?)
    {
        let url = host + "/users/me"
        func extract(json: JSON)
        {
            extractUser(json, success: success, failure: failure)
        }
        standardRequest(.GET, url: url, params: nil, success: extract, failure: failure)
    }
    static func getUserById(id: String, success: (user: [String: JSON]) -> (), failure: failureClosure?)
    {
        let url = "\(host)/users/\(id)"
        func extract(json: JSON)
        {
            extractUser(json, success: success, failure: failure)
        }
        standardRequest(.GET, url: url, params: nil, success: extract, failure: failure)
    }
    static func getAllUsers(success success: (users: [JSON]) -> (), failure: failureClosure?)
    {
        let url = host + "/users"
        func extract(json: JSON)
        {
            if let users = json["users"].array {
                success(users: users)
            } else {
                let message = "Could Not Extract Users Array"
                print(message)
                failure?(message: message, code: 0)
            }
        }
        standardRequest(.GET, url: url, params: nil, success: extract, failure: failure)
    }
    static func getAllFriends(success success: (friends: [JSON]) -> (), failure: failureClosure?)
    {
        if token == nil {
            failure?(message: "Token Nil -> Is User Logged In With Facebook?", code: 0)
        }
        let url = "https://graph.facebook.com/me/friends?access_token=\(token.tokenString!)"
        func extract(json: JSON)
        {
            if let friends = json["data"].array {
                success(friends: friends)
            } else {
                let message = "Could Not Extract Friends Array"
                print(message)
                failure?(message: message, code: 0)
            }
        }
        standardRequest(.GET, url: url, params: nil, success: extract, failure: failure)
    }
    static func getUserStats(id: String, success: (stats: [String: JSON]) -> (), failure: failureClosure?)
    {
        let url = "\(host)/users/me?stats=\(id)"
        func extract(json: JSON)
        {
            if let stats = json["stats"].dictionary {
                success(stats: stats)
            } else {
                let message = "Could Not Extract Stats Object"
                print(message)
                failure?(message: message, code: 0)
            }
        }
        standardRequest(.GET, url: url, params: nil, success: extract, failure: failure)
    }
    static func startNewMatchWithUser(opponentId: String, success: (match: [String:JSON]) -> (), failure: failureClosure?)
    {
        func extract(json: JSON)
        {
            extractMatch(json, success: success, failure: failure)
        }
        let url = "\(host)/matches"
        let params = [ "opponentId": opponentId ]
        standardRequest(.POST, url: url, params: params, success: extract, failure: failure)
    }
    static func getMatchById(id: String, success: (match: [String: JSON]) -> (), failure: failureClosure?)
    {
        func extract(json: JSON)
        {
            extractMatch(json, success: success, failure: failure)
        }
        let url = "\(host)/matches/\(id)"
        standardRequest(.GET, url: url, params: nil, success: extract, failure: failure)
    }
    static func getMatchByUserId(id: String, success: (match: [String: JSON]) -> (), failure: failureClosure?)
    {
        func extract(json: JSON)
        {
            extractMatch(json, success: success, failure: failure)
        }
        let url = "\(host)/matches?opponentId=\(id)&current=true"
        standardRequest(.GET, url: url, params: nil, success: extract, failure: failure)
    }
    static func extractUser(json: JSON, success: (user: [String: JSON]) -> (), failure: failureClosure?)
    {
        if let user = json["user"].dictionary {
            success(user: user)
        } else {
            let message = "Could Not Extract User Object"
            print(message)
            failure?(message: message, code: 0)
        }
    }
    static func extractMatch(json: JSON, success: (match: [String: JSON]) -> (), failure: failureClosure?)
    {
        if let match = json["match"].dictionary {
            success(match: match)
        } else {
            let message = "Could Not Extract Match Object"
            print(message)
            failure?(message: message, code: 0)
        }
    }
}
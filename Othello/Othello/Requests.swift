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
    
    static func loginUser(completion: (Bool) -> ())
    {
        let graphRequest = FBSDKGraphRequest(graphPath: "me", parameters: ["fields": "id, name"])
        graphRequest.startWithCompletionHandler({ (connection, result, error) -> Void in
            if let err = error {
                print("Error: \(err)")
            } else {
                if let userdata = result as? [String: String] {
                    print(userdata)
                    Requests.login(userdata) {
                        success in
                        print("Token: \"\(self.token.tokenString)\"\n")
                        print("Successful? \(success)")
                        if success {
                            Requests.getUser {
                                success, data in
                                completion(success)
                            }
                        }
                    }
                }
            }
        })
    }
    static func login(userdata: [String: String], completion: (Bool) -> ())
    {
        if token == nil {
            return completion(false)
        }
        let url = host + "/login"
        let headers = [
            "x-auth-token": token.tokenString!
        ]
        Alamofire
        .request(.POST, url, parameters: userdata, headers: headers, encoding: .JSON)
        .responseJSON { response in
            switch response.result {
            case .Success(let data):
                print(data)
                completion(true)
            case .Failure(let error):
                print("Error: \(error)")
                completion(false)
            }
        }
    }
    static func getUser(completion: (Bool, JSON) -> ())
    {
        if token == nil {
            return completion(false, nil)
        }
        let url = host + "/users/" + token.userID
        let headers = [
            "x-auth-token": token.tokenString!
        ]
        Alamofire
        .request(.GET, url, headers: headers, encoding: .JSON)
        .responseJSON { response in
            switch response.result {
            case .Success(let data):
                let user = JSON(data)["userdata"]
                if user.exists() {
                    completion(true, user)
                } else {
                    print(data)
                    completion(false, nil)
                }
            case .Failure(let error):
                print(error)
                completion(false, nil)
            }
        }
    }
    static func getAllUsers(completion: (Bool, [JSON]) -> ())
    {
        if token == nil {
            return completion(false, [JSON]())
        }
        let url = host + "/users"
        let headers = [
            "x-auth-token": token.tokenString!
        ]
        Alamofire
        .request(.GET, url, headers: headers, encoding: .JSON)
        .responseJSON { response in
            switch response.result {
            case .Success(let data):
                if let users = JSON(data)["users"].array {
                    completion(true, users)
                } else {
                    print(data)
                    completion(false, [JSON]());
                }
            case .Failure(let error):
                print(error)
                completion(false, [JSON]())
            }
        }
    }
    static func getAllFriends(completion: (Bool, [JSON]) -> ())
    {
        if token == nil {
            return completion(false, [JSON]())
        }
        let url = "https://graph.facebook.com/me/friends?access_token=\(token.tokenString!)"
        Alamofire
        .request(.GET, url, encoding: .JSON)
        .responseJSON { response in
            switch response.result {
            case .Success(let data):
                if let friends = JSON(data)["data"].array {
                    completion(true, friends)
                } else {
                    print(data)
                    completion(false, [JSON]())
                }
            case .Failure(let error):
                print(error)
                completion(false, [JSON]())
            }
        }
    }
    static func getOpponentHistory(id: String, completion: (Bool, JSON) -> ())
    {
        if token == nil {
            return completion(false, JSON.null)
        }
        let url = "\(host)/users/\(id)?history=\(token.userID)"
        let headers = [
            "x-auth-token": token.tokenString!
        ]
        Alamofire
        .request(.GET, url, headers: headers, encoding: .JSON)
        .responseJSON { response in
            switch response.result {
            case .Failure(let error):
                print(error)
                completion(false, JSON.null)
            case .Success(let data):
                if response.response?.statusCode != 200 {
                    print("Status Code \(response.response!.statusCode): \(data.valueForKey("message"))")
                } else {
                    let history = JSON(data)["userdata"]["history"]
                    completion(true, history)
                }
            }
        }
    }
    static func startNewMatchWithOpponent(fbid: String, completion: (Bool, JSON) -> ())
    {
        if token == nil {
            return completion(false, JSON.null)
        }
        let url = "\(host)/matches"
        let params = [
            "opponentFacebookId": fbid
        ]
        let headers = [
            "x-auth-token": token.tokenString!
        ]
        Alamofire
        .request(.POST, url, parameters: params, headers: headers, encoding: .JSON)
        .responseJSON { response in
            switch response.result {
            case .Failure(let error):
                print(error)
                completion(false, JSON.null)
            case .Success(let data):
                if response.response?.statusCode != 200 {
                    print("Status Code \(response.response!.statusCode): \(data.valueForKey("message"))")
                } else {
                    let match = JSON(data)["match"]
                    completion(true, match)
                }
            }
        }
    }
}
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
    static let host = "http://david.local:5000"
    static var token = FBSDKAccessToken.currentAccessToken()
    static func login(userdata: [String: String], completion: (Bool) -> ())
    {
        if token == nil {
            return completion(false)
        }
        let tokenString = token.tokenString!
        let url = host + "/login"
        let headers = [
            "x-auth-token": tokenString
        ]
        Alamofire
        .request(.POST, url, parameters: userdata, headers: headers)
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
            completion(false, JSON.null)
        }
        let url = host + "/users/" + token.userID
        let headers = [
            "x-auth-token": token.tokenString!
        ]
        Alamofire
        .request(.GET, url, headers: headers)
        .responseJSON { response in
            switch response.result {
            case .Success(let data):
                completion(true, JSON(data))
            case .Failure(let error):
                completion(false, JSON(error))
            }
        }
    }
}
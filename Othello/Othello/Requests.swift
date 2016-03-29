//
//  Requests.swift
//  Othello
//
//  Created by David Wolgemuth on 3/29/16.
//  Copyright © 2016 David. All rights reserved.
//

import Foundation
import Alamofire

class Requests
{
    static let host = "http://david.local:5000"
    static func login()
    {
        let url = host + "/api"
        Alamofire
            .request(.GET, url)
//            .responseJSON { response in
//                switch response.result {
//                case .Success(let data):
//                    print("Success: \(data)")
//                case .Failure(let error):
//                    print("Error: \(error)")
//                }
            .response {
                a, b, c, d in
                print(a)
                print(b)
                print(c)
                print(d)
            }
    }
}
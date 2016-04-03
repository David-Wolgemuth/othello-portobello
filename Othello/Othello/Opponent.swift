//
//  Opponent.swift
//  Othello
//
//  Created by David Wolgemuth on 3/30/16.
//  Copyright © 2016 David. All rights reserved.
//

import Foundation

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
    let name: String
    let type: OpponentType
    var names: (first: String?, middle: String?, last: String?)
    
    static let easyAI = Opponent(id: "easy_ai", name: "AI (easy)", type: .AI)
    static let normalAI = Opponent(id: "normal_ai", name: "AI (normal)", type: .AI)
    
    init(id: String, name: String, type: OpponentType)
    {
        self.id = id
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
        return "https://graph.facebook.com/\(id)/picture?type=\(size.rawValue)"
    }
}

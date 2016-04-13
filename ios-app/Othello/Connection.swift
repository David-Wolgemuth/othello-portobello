//
//  Connection.swift
//  Othello
//
//  Created by David Wolgemuth on 4/6/16.
//  Copyright © 2016 David. All rights reserved.
//

import SocketIOClientSwift
import SwiftyJSON

enum SubscriptionType: String
{
    case Match = "match"
    case UserAll = "user-all"
}

class Connection
{
    static let sharedInstance = Connection()
    
    var socket: SocketIOClient?
    var connected = false
    let host = NSProcessInfo.processInfo().environment["HOST_SITE"]!
    var subscriptions = [(SubscriptionType, String)]()
    var userId: String?
    
    private init()
    {
        connect()
    }
    func connect()
    {
        if connected {
            return
        }
        let url = NSURL(string: host)!
        let options = SocketIOClientOption.ExtraHeaders(["x-auth-token": Requests.token.tokenString])
        socket = SocketIOClient(socketURL: url, options: Set(arrayLiteral: options))
        socket!.connect()
        print("Here")
        socket!.onAny { event in
            print("Socket Event: \"\(event.event)\" -> \(JSON(event.items!))")
        }
        socket!.on("connect") { _,_ in
            print("Socket Connected")
        }
        socket!.on("validated") { data, ack in
            self.resubscribe()
            if data.count == 1 {
                if let id = data[0] as? String {
                    if self.userId != id {
                        self.userId = id
                        self.subscribeToUserAll()
                    }
                }
            }
        }
        connected = true
    }
    func subscribeToUserAll()
    {
        if let id = userId {
            subscribe(.UserAll, objId: id) { json in
                print("User Affected: \(json)")
            }
        } else {
            print("No User Id")
        }
    }
    func resubscribe()
    {
        for subscription in subscriptions {
            print(subscription)
            subscribeWithoutHandler(subscription.0, objId: subscription.1)
        }
    }
    func subscribe(type: SubscriptionType, objId: String, handler: (JSON) -> ())
    {
        subscribeWithoutHandler(type, objId: objId)
        socket?.on(objId) { data, ack in
            handler(JSON(data))
        }
    }
    func subscribeWithoutHandler(type: SubscriptionType, objId: String)
    {
        let room = [
            "type": type.rawValue,
            "id": objId
        ]
        let subscription = (type, objId)
        var subscribed = false
        for subscription in subscriptions {
            if subscription.1 == objId {
                subscribed = true
            }
        }
        if !subscribed {
            subscriptions.append(subscription)
        }
        socket?.emit("subscribe", room)
    }
    func unsubscribe(objId: String)
    {
        let room = [
            "id": objId
        ]
        for i in 0..<subscriptions.count {
            if subscriptions[i].1 == objId {
                subscriptions.removeAtIndex(i)
                break
            }
        }
        socket?.emit("unsubscribe", room)
    }
}

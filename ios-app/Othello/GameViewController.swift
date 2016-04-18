//
//  GameViewController.swift
//  Othello
//
//  Created by David Wolgemuth on 4/14/16.
//  Copyright © 2016 David. All rights reserved.
//

import UIKit

class GameViewController: UIViewController
{
    var opponent: User!
    var board: BoardViewController!
    var header: HeaderViewController!
    var footer: FooterViewController!
    var match: Match!
    
    override func viewDidLoad()
    {
        Requests.startNewMatchWithUser(opponent.id, success: { matchJSON in
            let _ = Match(matchJSON: matchJSON, success: { match in
                self.setMatchForAllViews(match)
                self.board.updateTiles()
                Connection.sharedInstance.subscribe(.Match, objId: match.id) { json in
                    Requests.extractMatch(json, success: { matchJSON in
                        self.match.update(withJSON: matchJSON, success: { _ in
                            self.board.updateTiles()
                        }, failure: { message, code in
                            print("PUSHED ERROR: \(message)")
                        })
                    }, failure: { message, code in
                        print(message)
                    })
                }
            }, failure: { message, code in
                print("ERROR SAVING MATCH: \(message)")
            })
        }, failure: { (message, code) in
            print("Could Not Start Match With \(self.opponent.name)")
        })
    }
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?)
    {
        if let identifier = segue.identifier {
            switch identifier {
            case "embedHeader":
                header = segue.destinationViewController as! HeaderViewController
                break;
            case "embedFooter":
                footer = segue.destinationViewController as! FooterViewController
                footer.opponent = opponent
                break;
            case "embedBoard":
                board = segue.destinationViewController as! BoardViewController
                break;
            default:
                break;
            }
        }
    }
    func setMatchForAllViews(match: Match)
    {
        self.match = match
        self.board.match = match
        self.header.match = match
        self.footer.match = match
    }
}
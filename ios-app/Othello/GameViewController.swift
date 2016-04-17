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
        print("Loaded Controller")
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
}
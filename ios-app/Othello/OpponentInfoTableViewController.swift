//
//  UserInfoTableViewController.swift
//  Othello
//
//  Created by David Wolgemuth on 3/31/16.
//  Copyright © 2016 David. All rights reserved.
//

import UIKit

protocol UserInfoTableViewDelegate
{
   func dismissViewControllerAnimated(flag: Bool, completion: (() -> Void)?)
}

class UserInfoTableViewController: UITableViewController
{
    var opponent: User!
    var delegate: UserInfoTableViewDelegate!
    
    @IBOutlet weak var profileImageView: UIImageView!
    @IBOutlet weak var firstNameLabel: UILabel!
    @IBOutlet weak var middleNameLabel: UILabel!
    @IBOutlet weak var lastNameLabel: UILabel!
    @IBOutlet weak var playerUserStatsLabel: UILabel!
    @IBOutlet weak var opponentStatsLabel: UILabel!
    override func viewDidAppear(animated: Bool)
    {
        super.viewDidAppear(animated)
        if opponent == nil {
            delegate?.dismissViewControllerAnimated(true, completion: nil)
            return
        }
        setNames()
        setProfileImage()
        getHistory()
    }
    override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath)
    {
        if indexPath.row == 1 {
            print("Go To Game")
        }
    }
    func setNames()
    {
        firstNameLabel.text = opponent.names.first
        middleNameLabel.text = opponent.names.middle
        lastNameLabel.text = opponent.names.last
    }
    func getHistory()
    {
        Requests.getUserStats(opponent.id, success: { (stats) in
            if stats["totals"] != nil {
                let total = "\(stats["totals"]!["wins"]) : \(stats["totals"]!["losses"]))"
                self.opponentStatsLabel.text = total
            }
            if stats["versus"] != nil {
                let versus = "\(stats["versus"]!["wins"]) : \(stats["versus"]!["losses"]))"
                self.playerUserStatsLabel.text = versus
            }
            }, failure: { message, code in
                print("Unable to get User Stats")
        })
    }
    func setProfileImage()
    {
        if opponent.type == UserType.AI {
            let image = UIImage(named: (opponent.getImageURL(size: .Normal)))
            profileImageView.image = image
        } else {
            if let url = NSURL(string: opponent.getImageURL(size: .Large)) {
                if let data = NSData(contentsOfURL: url) {
                    let image = UIImage(data: data)
                    profileImageView.image = image
                }
            }
        }
    }
}

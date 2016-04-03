//
//  OpponentInfoTableViewController.swift
//  Othello
//
//  Created by David Wolgemuth on 3/31/16.
//  Copyright © 2016 David. All rights reserved.
//

import UIKit

protocol OpponentInfoTableViewDelegate
{
   func dismissViewControllerAnimated(flag: Bool, completion: (() -> Void)?)
}

class OpponentInfoTableViewController: UITableViewController
{
    var opponent: Opponent!
    var delegate: OpponentInfoTableViewDelegate!
    
    @IBOutlet weak var profileImageView: UIImageView!
    @IBOutlet weak var firstNameLabel: UILabel!
    @IBOutlet weak var middleNameLabel: UILabel!
    @IBOutlet weak var lastNameLabel: UILabel!
    @IBOutlet weak var playerOpponentHistoryLabel: UILabel!
    @IBOutlet weak var opponentHistoryLabel: UILabel!
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
        Requests.getOpponentHistory(opponent.id) {
            success, history in
            if success {
                let total = "\(history["totals"]["wins"]) : \(history["totals"]["losses"])"
                self.opponentHistoryLabel.text = total
                let versus = "\(history["versus"]["wins"]) : \(history["versus"]["losses"])"
                self.playerOpponentHistoryLabel.text = versus
            }
        }
    }
    func setProfileImage()
    {
        if opponent.type == .AI {
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

//
//  MainTableViewController.swift
//  Othello
//
//  Created by David Wolgemuth on 3/30/16.
//  Copyright © 2016 David. All rights reserved.
//

import UIKit
import SwiftyJSON

class OpponentCell: UITableViewCell
{
    @IBOutlet weak var profileImage: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
}

class MainTableViewController: UITableViewController
{
    var mainViewController: MainViewController?
    var opponents = [
        // AI           Friend        NonFriend
        [Opponent](), [Opponent](), [Opponent]()
    ]
    
    override func viewDidLoad()
    {
        super.viewDidLoad()
        getOpponents()
    }
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?)
    {
        
    }
    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int
    {
        return opponents[section].count
    }
    override func tableView(tableView: UITableView, titleForHeaderInSection section: Int) -> String?
    {
        switch section {
        case 0:
            return "AI Opponents"
        case 1:
            return "Friends"
        case 2:
            return "All Users"
        default:
            return nil
        }
    }
    override func numberOfSectionsInTableView(tableView: UITableView) -> Int
    {
        return opponents.count
    }
    override func tableView(tableView: UITableView, accessoryButtonTappedForRowWithIndexPath indexPath: NSIndexPath)
    {
        mainViewController?.performSegueWithIdentifier("OpponentInfoPopoverSegue", sender: opponents[indexPath.section][indexPath.row])
    }
    override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath)
    {
        let opponent = opponents[indexPath.section][indexPath.row]
        Requests.startNewMatchWithOpponent(opponent.id, success: { (match) in
            print("Successfully Started Match With \(opponent.name): \(match)")
            }, failure: { (message, code) in
            print("Could Not Start Match With \(opponent.name)")
        })
    }
    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell
    {
        let cell = tableView.dequeueReusableCellWithIdentifier("OpponentCell") as! OpponentCell
        let opponent = opponents[indexPath.section][indexPath.row]
        if opponent.type == .AI {
            // AI Opponent
            cell.profileImage.image = UIImage(named: opponent.getImageURL(size: .Normal))
        } else {
            if let url = NSURL(string: opponent.getImageURL(size: .Normal)) {
                if let data = NSData(contentsOfURL: url) {
                    cell.profileImage.image = UIImage(data: data)
                }
            }
        }
        cell.nameLabel.text = opponent.name
        return cell
    }
    func getOpponents()
    {
        Opponent.getAllOpponents(success: { (opponents) in
            for opponent in opponents {
                switch opponent.type {
                case .AI:
                    self.opponents[0].append(opponent)
                case .Friend:
                    self.opponents[1].append(opponent)
                case .NonFriend:
                    self.opponents[2].append(opponent)
                }
            }
            self.tableView.reloadData()
        }, failure: { (message, code) -> ()? in
            self.displayErrorAlert()
        })
    }
    func displayErrorAlert()
    {
        let alert = UIAlertController(title: "Error", message: "Error Getting Users From Server", preferredStyle: .Alert)
        let okay = UIAlertAction(title: "Okay", style: .Default, handler: nil)
        alert.addAction(okay)
        presentViewController(alert, animated: true, completion: nil)
    }
}

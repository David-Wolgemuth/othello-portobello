//
//  MainTableViewController.swift
//  Othello
//
//  Created by David Wolgemuth on 3/30/16.
//  Copyright © 2016 David. All rights reserved.
//

import UIKit
import SwiftyJSON

class UserCell: UITableViewCell
{
    @IBOutlet weak var profileImage: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
}

class MainTableViewController: UITableViewController
{
    var mainViewController: MainViewController?
    var opponents = [
        // AI           Friend        NonFriend
        [User](), [User](), [User]()
    ]
    
    override func viewDidLoad()
    {
        super.viewDidLoad()
        getUsers()
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
            return "AI Users"
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
        mainViewController?.performSegueWithIdentifier("UserInfoPopoverSegue", sender: opponents[indexPath.section][indexPath.row])
    }
    override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath)
    {
        let opponent = opponents[indexPath.section][indexPath.row]
        let storyboard = UIStoryboard(name: "Game", bundle: nil)
        let gameViewController = storyboard.instantiateInitialViewController() as! GameViewController
        gameViewController.opponent = opponent
        presentViewController(gameViewController, animated: true, completion: { print("Transitioned") })
        
//        Requests.startNewMatchWithUser(opponent.id, success: { (match) in
//            print("Successfully Started Match With \(opponent.name): \(match)")
//            if let matchId = match["_id"]?.string {
//                Connection.sharedInstance.subscribe(.Match, objId: matchId) { json in
//                    print(json)
//                }
//            }
//            }, failure: { (message, code) in
//            print("Could Not Start Match With \(opponent.name)")
//        })
    }
    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell
    {
        let cell = tableView.dequeueReusableCellWithIdentifier("UserCell") as! UserCell
        let opponent = opponents[indexPath.section][indexPath.row]
        if opponent.type == .AI {
            // AI User
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
    func getUsers()
    {
        User.getAllUsers(success: { (opponents) in
            for opponent in opponents {
                switch opponent.type {
                case .AI:
                    self.opponents[0].append(opponent)
                    break
                case .Friend:
                    self.opponents[1].append(opponent)
                    break
                case .NonFriend:
                    self.opponents[2].append(opponent)
                    break
                case .Player:
                    break
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

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
        getAllOpponents {
            success in
            if success {
                self.tableView.reloadData()
            } else {
                self.displayErrorAlert()
            }
        }
    }
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        
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
        let fbid = opponents[indexPath.section][indexPath.row].id
        Requests.startNewMatchWithOpponent(fbid) {
            success, match in
            print("Success? \(success)")
            print("New Match: \(match)")
        }
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
    func getAllOpponents(completion: (Bool) -> ())
    {
        opponents[0].append(Opponent.easyAI)
        opponents[0].append(Opponent.normalAI)
        
        Requests.getAllUsers { success, users in
            if (success) {
                self.addFriendsToOpponents(users) {
                    self.addNonFriendsToOpponents(users)
                    completion(true)
                }
            } else {
                completion(false)
            }
        }
    }
    func addFriendsToOpponents(users: [JSON], completion: () -> ())
    {
        Requests.getAllFriends { success, friends in
            if (success) {
                for friend in friends {
                    if let id = friend["id"].string {
                        if let name = friend["name"].string {
                            var isUser = false
                            for user in users {
                                if user["facebookId"].string == id {
                                    isUser = true
                                    break
                                }
                            }
                            if !isUser {
                                continue
                            }
                            let opp = Opponent(id: id, name: name, type: .Friend)
                            self.opponents[1].append(opp)
                            continue
                        }
                    }
                    print("Error parsing friend: \(friend)")
                }
            } else {
                print("Error Getting Friends")
            }
            completion()
        }
    }
    func addNonFriendsToOpponents(users: [JSON])
    {
        for user in users {
            if let id = user["facebookId"].string {
                if id == FBSDKAccessToken.currentAccessToken().userID {
                    continue
                }
                var isFriend = false
                for friend in opponents[1] {
                    if friend.id == id {
                        isFriend = true
                        break
                    }
                }
                if isFriend {
                    continue
                }
                if let name = user["name"].string {
                    let opp = Opponent(id: id, name: name, type: .NonFriend)
                    self.opponents[2].append(opp)
                    continue
                }
            }
            print("Error parsing user: \(user)")
        }
    }
    func displayErrorAlert()
    {
        let alert = UIAlertController(title: "Error", message: "Error Getting Users From Server", preferredStyle: .Alert)
        let okay = UIAlertAction(title: "Okay", style: .Default, handler: nil)
        alert.addAction(okay)
        presentViewController(alert, animated: true, completion: nil)
    }
}

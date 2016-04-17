//
//  MainViewController.swift
//  Othello
//
//  Created by David Wolgemuth on 3/30/16.
//  Copyright © 2016 David. All rights reserved.
//

import UIKit

class MainViewController: UIViewController, UserInfoTableViewDelegate, UIPopoverPresentationControllerDelegate
{
    var welcomeViewController: WelcomeViewController?
    @IBOutlet weak var searchTextField: UITextField!
    
    @IBAction func userInfoButton(sender: UIBarButtonItem) {
        self.performSegueWithIdentifier("showUserInfo", sender: self)
    }
    
    
    override func viewDidLoad()
    {
        Requests.getUser(success: { user in
            User.setPlayer(user)
            if let name = user["name"]?.string {
                self.navigationController?.navigationBar.topItem?.title = name
                Connection.sharedInstance.connect()
            }
        }, failure: { message, code in
            self.loginErrorAlert(message)
        })
        super.viewDidLoad()
    }
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?)
    {
        if segue.identifier == "EmbedTableView" {
            let controller = segue.destinationViewController as? MainTableViewController
            controller?.mainViewController = self
        }
        
        if segue.identifier == "UserInfoPopoverSegue" {
            let opponent = sender as! User
            let controller = segue.destinationViewController as! UserInfoTableViewController
            controller.popoverPresentationController?.delegate = self
            controller.opponent = opponent
            controller.delegate = self
        }
        if segue.identifier == "showUserInfo"
        {
            let vc = segue.destinationViewController
            let controller = vc.popoverPresentationController
            controller?.delegate = self
        }
        
    }
    func adaptivePresentationStyleForPresentationController(controller: UIPresentationController) -> UIModalPresentationStyle
    {
        return UIModalPresentationStyle.None
    }
    func loginErrorAlert(message: String?)
    {
        let alert = UIAlertController(title: "Login Error", message: message, preferredStyle: .Alert)
        let okay = UIAlertAction(title: "Okay", style: .Default) {
            action in
            self.welcomeViewController?.dismissViewControllerAnimated(true, completion: nil)
        }
        alert.addAction(okay)
        presentViewController(alert, animated: true, completion: nil)
    }
}

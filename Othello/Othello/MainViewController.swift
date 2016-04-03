//
//  MainViewController.swift
//  Othello
//
//  Created by David Wolgemuth on 3/30/16.
//  Copyright © 2016 David. All rights reserved.
//

import UIKit

class MainViewController: UIViewController, OpponentInfoTableViewDelegate, UIPopoverPresentationControllerDelegate
{
    var welcomeViewController: WelcomeViewController?
    @IBOutlet weak var searchTextField: UITextField!
    
    override func viewDidLoad()
    {
        Requests.getUser {
            success, json in
            if !success {
                print(json)
                let message = json["message"].string
                self.loginErrorAlert(message)
            } else {
                if let name = json["userdata"]["name"].string {
                    print(name)
                    self.navigationController?.navigationBar.topItem?.title = name
                }
            }
        }
        super.viewDidLoad()
    }
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?)
    {
        if segue.identifier == "EmbedTableView" {
            let controller = segue.destinationViewController as? MainTableViewController
            controller?.mainViewController = self
        }
        if segue.identifier == "OpponentInfoPopoverSegue" {
            let opponent = sender as! Opponent
            let controller = segue.destinationViewController as! OpponentInfoTableViewController
            controller.popoverPresentationController?.delegate = self
            controller.opponent = opponent
            controller.delegate = self
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

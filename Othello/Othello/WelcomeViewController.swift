//
//  ViewController.swift
//  Othello
//
//  Created by David Wolgemuth on 3/29/16.
//  Copyright © 2016 David. All rights reserved.
//

import UIKit

class WelcomeViewController: UIViewController, FBSDKLoginButtonDelegate
{
    override func viewDidAppear(animated: Bool)
    {
        super.viewDidAppear(animated)
        if FBSDKAccessToken.currentAccessToken() == nil {
            displayLoginButton()
        } else {
            loginUser()
        }
    }
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?)
    {
        if (segue.identifier == "MainViewSegue") {
            let controller = segue.destinationViewController as? MainViewController
            controller?.welcomeViewController = self
        }
    }
    func displayLoginButton()
    {
        let loginView = FBSDKLoginButton()
        self.view.addSubview(loginView)
        loginView.center = self.view.center
        loginView.readPermissions = ["public_profile", "user_friends"]
        loginView.delegate = self
    }
    func loginButton(loginButton: FBSDKLoginButton!, didCompleteWithResult result: FBSDKLoginManagerLoginResult!, error: NSError!)
    {
        if let err = error {
            print("Error: \(err)")
        } else if result.isCancelled {
            // Handle Cancellations
        } else {
            loginUser()
        }
    }
    func loginUser()
    {
        Requests.loginUser { success in
            if (success) {
                self.performSegueWithIdentifier("MainViewSegue", sender: nil)
            }
        }
    }
    func loginButtonDidLogOut(loginButton: FBSDKLoginButton!)
    {
        print("Logged Out")
    }
}


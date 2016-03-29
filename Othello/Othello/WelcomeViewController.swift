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
    override func viewDidLoad()
    {
        super.viewDidLoad()
        login()
    }
    func login()
    {
//        if FBSDKAccessToken.currentAccessToken() != nil {
//            // User Logged In
//        } else {
            let loginView = FBSDKLoginButton()
            self.view.addSubview(loginView)
            loginView.center = self.view.center
            loginView.readPermissions = ["public_profile"]
            loginView.delegate = self
//        }
    }
    func loginButton(loginButton: FBSDKLoginButton!, didCompleteWithResult result: FBSDKLoginManagerLoginResult!, error: NSError!)
    {
        if let err = error {
            print("Error: \(err)")
        } else if result.isCancelled {
            // Handle Cancellations
        } else {
            print(result.token.tokenString)
            returnUserData()
        }
    }
    func returnUserData()
    {
        let graphRequest = FBSDKGraphRequest(graphPath: "me", parameters: ["fields": "id, name"])
        graphRequest.startWithCompletionHandler({ (connection, result, error) -> Void in
            if let err = error {
                print("Error: \(err)")
            } else {
                if let userdata = result as? NSDictionary {
                    print(userdata)
                }
            }
        })
    }
    func loginButtonDidLogOut(loginButton: FBSDKLoginButton!)
    {
        print("Logged Out")
    }
}


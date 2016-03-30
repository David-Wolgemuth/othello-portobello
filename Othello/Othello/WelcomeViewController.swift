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
        displayLoginButton()
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
            let token = result.token.tokenString
            loginUser(withToken: token)
        }
    }
    func loginUser(withToken token: String)
    {
        let graphRequest = FBSDKGraphRequest(graphPath: "me", parameters: ["fields": "id, name"])
        graphRequest.startWithCompletionHandler({ (connection, result, error) -> Void in
            if let err = error {
                print("Error: \(err)")
            } else {
                if let userdata = result as? [String: String] {
                    print(userdata)
                    Requests.login(userdata) {
                        success in
                        print("Successful? \(success)")
                        if success {
                            Requests.getUser {
                                success, data in
                                print("Got User Data Back? \(success)")
                                print("Token: \(Requests.token.tokenString)")
                                print(data)
                            }
                        }
                    }
                }
            }
        })
    }
    func loginButtonDidLogOut(loginButton: FBSDKLoginButton!)
    {
        print("Logged Out")
    }
}


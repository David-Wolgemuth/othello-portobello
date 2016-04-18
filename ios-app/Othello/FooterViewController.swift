//
//  FooterViewController.swift
//  Othello
//
//  Created by David Wolgemuth on 4/14/16.
//  Copyright © 2016 David. All rights reserved.
//

import UIKit

class FooterViewController: UIViewController
{
    @IBOutlet weak var playerImageView: UIImageView!
    @IBOutlet weak var opponentImageView: UIImageView!
    
    @IBOutlet weak var playerScoreLabel: UILabel!
    @IBOutlet weak var opponentScoreLabel: UILabel!
    
    var opponent: User!
    var match: Match!
    
    override func viewDidLoad()
    {
        setImages()
    }
    func setImages()
    {
        if let url = NSURL(string: User.player.getImageURL(size: .Large)) {
            print(url.absoluteString)
            if let data = NSData(contentsOfURL: url) {
                let image = UIImage(data: data)
                playerImageView.image = image
            }
        
        }
        if opponent.type! == .AI {
            let image = UIImage(named: opponent.getImageURL(size: .Normal))
            opponentImageView.image = image
        } else if let url = NSURL(string: opponent.getImageURL(size: .Large)) {
            print(url.absoluteString)
            if let data = NSData(contentsOfURL: url) {
                let image = UIImage(data: data)
                opponentImageView.image = image
            }
        
        }
    }
}


function SideBarController (Auth, User, Match)
{
    var self = this;

    self.update = function ()
    {
        self.users = User.users;
        self.matches = Match.matches;
    };

}

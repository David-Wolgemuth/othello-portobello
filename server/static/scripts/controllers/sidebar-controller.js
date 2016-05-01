
module.exports = SideBarController;

function SideBarController (Auth, User, Match)
{
    var self = this;
    self.open = false;

    Auth.onLogin(function () {
        self.update();
    });
    Match.on("shouldMakeMove", function () {
        console.log("Running:", self.open);
        return !self.open;
    });
    self.update = function ()
    {
        self.users = User.users;
        self.matches = Match.matches;
    };
    self.clickedMatch = function (match)
    {
        Match.switchMatch(match._id)
        .then(function () {
            self.open = false;
        });
    };
}

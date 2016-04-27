
function SideBarController (authenticationFactory, userFactory, matchFactory)
{
    var self = this;

    authenticationFactory.onLogin.push(function ()
    {
        userFactory.getUsers()
        .then(function (users) {
            self.users = users;
        });
    });

    self.matches = [{ text: "hi" }, { text: "bye", currentTurn: true }, { text: "sigh"}];
}

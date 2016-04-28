
function MainController (Auth, User, Match, $document, $scope)
{
    var self = this;
    self.hamburger = false;
    self.toggleVisibleGames = false;

    self.login = function ()
    {
        Auth.login()
        .then(function () {
            self.didLogIn();
        })
        .catch(function() {
            self.loggedIn = false;
        });
    };
    self.logout = function ()
    {
        Auth.logout(function () {
            $scope.$apply(function () {
                self.loggedIn = false;
            });
        });
    };
    self.checkLoginState = function ()
    {
        Auth.getLoginStatus()
        .then(function () {
            User.createUserIfNotExists()
            .then(function () {
                self.didLogIn();
            })
            .catch(function () {
                console.log("Error Creating User / Logging In");
                self.loggedIn = false;
            });
        })
        .catch(function (error) {
            console.log("Login Error:", error);
            self.loggedIn = false;
        });
    };
    self.didLogIn = function ()
    {
        self.loggedIn = true;
        User.getUsers();
        Match.getAllContainingPlayer();
    };


    $document.ready(function () {
        setTimeout(self.checkLoginState, 1000);
    });
}

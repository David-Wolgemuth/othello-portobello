
function MainController (authenticationFactory, userFactory, $document, $scope)
{
    var self = this;
    self.hamburger = false;
    self.toggleVisibleGames = false;

    self.login = function ()
    {
        authenticationFactory.login()
        .then(function () {
            self.loggedIn = true;
        })
        .catch(function() {
            self.loggedIn = false;
        });
    };
    self.logout = function ()
    {
        authenticationFactory.logout(function () {
            $scope.$apply(function () {
                self.loggedIn = false;
            });
        });
    };
    self.checkLoginState = function ()
    {
        authenticationFactory.getLoginStatus()
        .then(function () {
            userFactory.createUserIfNotExists()
            .then(function () {
                console.log("Login Successful!!!");
                console.log("Token:", authenticationFactory.token);
                self.loggedIn = true;
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
    $document.ready(function () {
        console.log("Ready");
        setTimeout(self.checkLoginState, 1000);
    });
}

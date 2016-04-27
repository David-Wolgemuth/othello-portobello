
var othelloModule = angular.module("othelloApp", ["ngRoute", "ngHamburger"])
.factory("authenticationFactory", AuthenticationFactory)
.factory("userFactory", UserFactory)
.factory("matchFactory", MatchFactory)
.controller("mainController", MainController)
.controller("sidebarController", SideBarController);

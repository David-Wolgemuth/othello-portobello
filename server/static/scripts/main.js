
var othelloModule = angular.module("othelloApp", ["ngRoute", "ngHamburger"])
.factory("authenticationFactory", [
    "$q", "$http",
    AuthenticationFactory
])
.factory("userFactory", [
    "$q", "$http",
    UserFactory
])
.factory("matchFactory", [
    "$q", "$http", "userFactory",
    MatchFactory
])
.controller("sidebarController", [
    "authenticationFactory", "userFactory", "matchFactory", 
    SideBarController
])
.controller("mainController", [
    "authenticationFactory", "userFactory", "matchFactory", "$document", "$scope", 
    MainController
]);


var othelloModule = angular.module("othelloApp", ["ngRoute", "ngHamburger"])
.factory("authenticationFactory", [
    "$q", "$http",
    require("./factories/authentication-factory")
])
.factory("userFactory", [
    "$q", "$http",
    require("./factories/user-factory")
])
.factory("matchFactory", [
    "$q", "$http", "userFactory",
    require("./factories/match-factory")
])
.controller("sidebarController", [
    "authenticationFactory", "userFactory", "matchFactory", 
    require("./controllers/sidebar-controller")
])
.controller("pixiController", [
    "$window", "$scope", "matchFactory",
    require("./controllers/pixi-controller")
])
.controller("mainController", [
    "authenticationFactory", "userFactory", "matchFactory", "$document", "$scope", 
    require("./controllers/main-controller")
]);

require("./directives.js")(othelloModule);

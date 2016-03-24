var othelloModule = angular.module("othelloApp", ["ngRoute"])
.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl: "views/home.html"
    });
});
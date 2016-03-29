var othelloModule = angular.module("othelloApp", ["ngRoute", "ngCookies"])
.config(routesRegistry)
function routesRegistry($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl: "views/home.html"
    });
}


module.exports = function (app)
{
    app.directive("sidebar", function () {
        return {
            templateUrl: "views/sidebar.html"
        };
    })
    .directive('pixi', function () {
        return {
            template: "<canvas id='pixi-canvas'></canvas>",
            controller: "pixiController"
        };
    });
};

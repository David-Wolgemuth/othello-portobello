
var gulp = require("gulp");
var gutil = require("gulp-util");
var browserify = require("browserify");
var nodemon = require("gulp-nodemon");
var source = require("vinyl-source-stream");

gulp.task("browserify", function () {
    browserify("./server/static/scripts/main.js")
    .bundle()
    .on("error", function (error) {
        gutil.log("Gulp Error:", error);
    })
    .pipe(source("bundle.js"))
    .pipe(gulp.dest("./server/static/scripts/"));
});

gulp.task("start", function () {
    nodemon({
        script: "app.js",
        tasks: ["browserify"],
        ignore: ["bundle.js"]
    })
    .on("restart", function () {
        console.log("restarted!");
    });
});
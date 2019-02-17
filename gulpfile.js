/*
 * @Author: mikey.zhaopeng 
 * @Date: 2019-02-17 18:53:13 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-02-17 20:52:01
 */

var gulp = require("gulp"); //载入gulp
var sass = require("gulp-sass") //载入sass编译
var mincss = require("gulp-clean-css") //载入压缩css
var rename = require('gulp-rename') //载入文件重命名
var babel = require('gulp-babel') //载入es6转es5
var uglify = require("gulp-uglify") //载入压缩js
var htmlmin = require("gulp-htmlmin") //载入压缩html
var server = require("gulp-webserver") //载入server服务
var autoprefixter = require("gulp-autoprefixer") //载入自动添加浏览器前缀
var rev = require("gulp-rev") //给文件添加后缀名
var collector = require('gulp-rev-collector') //自动添加更改文件名
var imagemin = require("gulp-imagemin") //载入压缩图片
var fs = require("fs");
var path = require('path');
var url = require("url");
var data = require("./src/mork/data.json");

/*开发环境 */

//编译scss
gulp.task("comsass", function() {
    return gulp.src('./src/style/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest("./src/css"))
})

//编译js
gulp.task('comjs', function() {
    return gulp.src("./src/script/**/*.js")
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(gulp.dest('./src/js'))
})

//监听
gulp.task("auto", gulp.watch("./src/style/**/*.scss", gulp.series("comsass")))

//起服务
gulp.task("opserver", function() {
    return gulp.src("src")
        .pipe(server({
            host: 169.254 .149 .0,
            port: 3030,
            livereload: true,
            directoryListing: true,
            open: true,
            middleware: function(req, res, next) {
                var pathname = url.parse(req.url).pathname;
                //判断如果是接口
                if (pathname === "/api/list") {
                    res.end(JSON.stringify({ code: 1, msg: data }))
                } else {
                    //判断如果是文件
                    pathname = pathname === "/" ? "index.html" : pathname;
                    var upath = path.join("__dirname", "src", pathname);
                    res.end(fs.readFileSync(upath))

                }
            }
        }))

})

//默认执行
gulp.task('watch', gulp.parallel("comsass", "comjs", "opserver", "auto"))


/* 线上任务 */
//压缩html
gulp.task('ziphtml', () => {
    return gulp.src('src/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(revCollector({
            replaceReved: true,
        }))
        .pipe(gulp.dest('dist'));
});

//压缩css
gulp.task('zipcss', () => {
    return gulp.src('./src/css/**/*.css')
        .pipe(rev())
        .pipe(mincss())
        .pipe(gulp.dest('dist'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('dist/assets'))
});

//压缩js
gulp.task('zipjs', () => {
    return gulp.src('./src/script/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});
//压缩img
gulp.task('zipimg', () =>
    gulp.src('./src/images/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images'))
);

//上线

gulp.task("build", gulp.parallel('ziphtml', 'zipcss', 'zipjs', 'zipimg'))
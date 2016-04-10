var gulp = require('gulp');
var compass = require('gulp-compass');
var sass = require('gulp-ruby-sass');

gulp.task('scss',function(){
    return gulp.src('../scss/*.scss')
        .pipe(compass({
            sass:'../dev/scss/',
            css:'../stylesheets/'
        }))
        .on('error',function(){
            console.log('error');
        })
});
gulp.task('auto',function(){
    gulp.watch('../dev/scss/*.scss',['scss']);
});

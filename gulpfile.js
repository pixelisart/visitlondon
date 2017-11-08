var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var autoprefixer = require('gulp-autoprefixer');
var browserify = require('gulp-browserify');
var clean = require('gulp-clean');
var concat = require('gulp-concat');  
var merge = require('merge-stream');
var newer = require('gulp-newer');
var imagemin = require('gulp-imagemin');

// Points all the files that exists in the /src folder
var SOURCEPATHS = {
    sassSource : 'src/scss/*.scss', // Any file with .scss extension
    htmlSource : 'src/*.html', // Listens to all html files inside the /src folder
    jsSource : 'src/js/**', // Listens to any JavaScript files in the /js folder.
    imgSource : 'src/img/**' // This means all folders that are under /img folder. Looks for all types of images: jpg, jpeg, svg, gif etc.

}

// Points all the files that exists in the /app folder
var APPPATH = {
    root: 'app/',
    css : 'app/css',
    js : 'app/js',
    fonts : 'app/fonts',
    img : 'app/img'
}

// This task is to remove file(s) from /app folder when its corresponding file is removed from the /src folder.
gulp.task('clean-html', function(){
    return gulp.src(APPPATH.root + '/*.html', {read: false, force: true}) // This is to look for html files and not read the contents.
        .pipe(clean());
});

gulp.task('clean-scripts', function(){
    return gulp.src(APPPATH.js + '/*.js', {read: false, force: true}) // This is to look for html files and not read the contents.
        .pipe(clean());
});

gulp.task('sass', function(){

    var bootstrapCSS = gulp.src('./node_modules/bootstrap/dist/css/bootstrap.min.css');
    var sassFiles;

    sassFiles = gulp.src(SOURCEPATHS.sassSource)
        .pipe(autoprefixer())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        return merge(bootstrapCSS, sassFiles)
            .pipe(concat('app.css'))
            .pipe(gulp.dest(APPPATH.css));
});

gulp.task('images', function(){
    return gulp.src(SOURCEPATHS.imgSource)
        .pipe(newer(APPPATH.img)) // Checks if a new image is added to /src/img, it is copied over to the /app/img prod folder.
        .pipe(imagemin())
        .pipe(gulp.dest(APPPATH.img));
});

gulp.task('moveFonts', function(){
    gulp.src('./node_modules/bootstrap/dist/fonts/*.{eot,svg,ttf,woff,woff2}')
        .pipe(gulp.dest(APPPATH.fonts));
});

gulp.task('scripts', ['clean-scripts'], function() {
    gulp.src(SOURCEPATHS.jsSource)
        .pipe(concat('main.js'))
        .pipe(browserify())
        .pipe(gulp.dest(APPPATH.js))
});

// Copies html file from the /src folder to /app folder
gulp.task('copy', ['clean-html'], function(){
    gulp.src(SOURCEPATHS.htmlSource)
        .pipe(gulp.dest(APPPATH.root))
});

gulp.task('serve', ['sass'], function(){
    // browserSync will initialize all css, js and html when browserSync is initialized.
    browserSync.init([APPPATH.css + '/*.css', APPPATH.root + '/*.html', APPPATH.js + '/*.js'], {
        server: {
            baseDir : APPPATH.root
        }
    })
});

gulp.task('watch', ['serve', 'sass', 'copy', 'clean-html', 'clean-scripts', 'scripts', 'moveFonts', 'images'], function(){
    gulp.watch([SOURCEPATHS.sassSource], ['sass']);
    gulp.watch([SOURCEPATHS.htmlSource], ['copy']);
    gulp.watch([SOURCEPATHS.jsSource], ['scripts']);
});

gulp.task('default', ['watch']);
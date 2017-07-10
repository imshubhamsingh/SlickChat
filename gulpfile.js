var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var inject = require('gulp-inject');
var nodemon = require('gulp-nodemon');
var wiredep = require('wiredep').stream;

var File = ['./app/**/*.js', './app/**/*.html','./app/**/*.css'];

gulp.task('style', function () {
    'use strict';
    return gulp.src(jsFiles)
        .pipe(jshint())
        .pipe(jscs())
        .pipe(jshint.reporter('jshint-stylish', {
            verbose: true
        }))
        .pipe(jscs.reporter());

});
gulp.task('inject', function () {
    'use strict';
    var wireDepOption = {
        bowerJson: require('./bower.json'),
        directory: './public/lib',
        devDependencies: true,
        ignorePath: '../../public'
    };
    var injectSrc = gulp.src(['./public/css/*.css', './public/js/*.js'], {
        read: false
    });
    var injectOption = {
        ignorePath: '/public'
    };
    return gulp.src(htmlAndEjsFile)
        .pipe(wiredep(wireDepOption))
        .pipe(inject(injectSrc, injectOption))
        .pipe(gulp.dest('src/views'));
});
gulp.task('serve', ['style', 'inject'], function () {
    'use strict';
    var nodemonOptions = {
        script: 'app.js',
        delayTime: 1,
        env: {
            'PORT': 3000
        },
        watch: jsFiles

    };
    return nodemon(nodemonOptions)
        .on('restart', function (ev) {
            console.log('Restarting ...');
        });
});
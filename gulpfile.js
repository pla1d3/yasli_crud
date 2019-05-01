const gulp = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const csso = require('gulp-csso');

gulp.task('js', () =>
    gulp.src('src/js/*.js')
        .pipe(babel({
            presets: ['@babel/env'],
        }))
        .pipe(uglify())
        .pipe(gulp.dest('build/js'))
);

gulp.task('img', () =>
    gulp.src('src/res/**')
        .pipe(imagemin())
        .pipe(gulp.dest('build/res'))
);

gulp.task('css', () =>
    gulp.src('src/css/*.css')
        .pipe(csso())
        .pipe(gulp.dest('build/css'))
);

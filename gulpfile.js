const gulp = require("gulp");
const eslint = require("gulp-eslint");
const watch = require("gulp-watch");
const lec = require("gulp-line-ending-corrector");
//const uglify = require('gulp-uglify-es').default;

function lint() {
  return gulp
    .src(["src/**/*.js"])
    .pipe(lec())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

module.exports.lint = lint;

function compress() {
  return (
    gulp
      .src("src/**/*.js")
      //.pipe(uglify())
      .pipe(gulp.dest("build/"))
  );
}

module.exports.compress = compress;

module.exports.build = module.exports.default = gulp.series(lint, compress);

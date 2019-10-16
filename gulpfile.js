const gulp = require('gulp')
const concat = require('gulp-concat')
const sass = require('gulp-sass')
const browserSync = require('browser-sync')
// const ghPages = require("gulp-gh-pages");
const clean = require('gulp-clean')

gulp.task('clean', function() {
  return gulp
    .src(['./public', './.tmp'], { read: false, allowEmpty: true }) // 選項讀取：false阻止gulp讀取文件的內容，使此任務更快。allowEmpty: 允許資料夾不在也可執行。
    .pipe(clean())
})

// gulp.task('cleanCSS', function() {
//   return gulp
//     .src(['./public/stylesheets/all.css'], { read: false, allowEmpty: true }) // 選項讀取：false阻止gulp讀取文件的內容，使此任務更快。allowEmpty: 允許資料夾不在也可執行。
//     .pipe(clean())
// })

gulp.task('vendorJS', function() {
  return gulp
    .src([
      './node_modules/jquery/dist/jquery.slim.min.js',
      './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'
    ])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('./public/js'))
})

gulp.task('sass', function() {
  return gulp
    .src(['./source/stylesheets/**/*.scss', './source/stylesheets/**/*.sass'])
    .pipe(
      sass({
        outputStyle: 'nested',
        includePaths: ['./node_modules/bootstrap/scss']
      }).on('error', sass.logError)
    )
    .pipe(gulp.dest('./public/stylesheets'))
    .pipe(browserSync.reload({ stream: true }))
})

gulp.task('watch', function() {
  gulp.watch(
    ['./source/stylesheets/**/*.scss', './source/stylesheets/**/*.sass'],
    gulp.series('sass')
  )
  gulp.watch(
    ['./source/**/**', '!source/stylesheets/**/**'],
    gulp.series('copy')
  )
})

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: './public'
    }
  })
})

gulp.task('copy', function(done) {
  return gulp
    .src(['./source/**/**', '!source/stylesheets/**/**'])
    .pipe(gulp.dest('./public/'))
    .pipe(
      browserSync.reload({
        stream: true
      })
    )
  done()
})

gulp.task(
  'default',
  gulp.series(
    'clean',
    'copy',
    'sass',
    'vendorJS',
    gulp.parallel('browserSync', 'watch')
  )
)

gulp.task(
  "build",
  gulp.series(
    "clean",
    "copy",
    "sass",
    "vendorJS"
  )
);

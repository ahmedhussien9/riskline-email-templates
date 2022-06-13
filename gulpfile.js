const { src, dest, parallel, watch } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const browserSync = require("browser-sync").create();
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const postcssDirPseudoClass = require("postcss-dir-pseudo-class");
const postcssLogical = require("postcss-logical");
const combineSelectors = require("postcss-combine-duplicated-selectors");

const plumber = require("gulp-plumber");
const svgstore = require("gulp-svgstore");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const runSequence = require("run-sequence");
const cleanCSS = require("gulp-clean-css");
const cssnano = require("gulp-cssnano");

// sass task
const sassOptions = {
  outputStyle: "expanded",
};
//postCss plugins
const PostCssTasks = [
  autoprefixer(),
  postcssLogical(),
  postcssDirPseudoClass(),
  combineSelectors(),
];

function styles() {
  return (
    src(["src/scss/templates/**/*.scss"])
      .pipe(plumber())
      .pipe(sass(sassOptions).on("error", sass.logError))
      .pipe(postcss(PostCssTasks))
      // .pipe(cssnano())
      .pipe(dest("src/css/templates/"))
      .pipe(browserSync.reload({ stream: true }))
  );
}

function reloadBrowser(cb) {
  browserSync.reload();
  cb();
}

function serve(cb) {
  browserSync.init({
    server: "",
    socket: {
      domain: "localhost:3000",
    },
  });

  watch(["src/scss/**/*.scss"], styles);

  watch(["**/*.html"], { events: "change" }, reloadBrowser);

  watch(["**/*.js"], { events: "change" }, reloadBrowser);
  cb();
}

function prefix() {
  return src("src/css/global.css")
    .pipe(postcss([autoprefixer({ browsers: ["last 10 versions"] })]))
    .pipe(dest("src/css/auto/"));
}

function svgstoret() {
  return gulp
    .src("images/feature-icon/*.svg")
    .pipe(svgstore())
    .pipe(dest("images/feature-icons"));
}

function image() {
  return src("testimg/*").pipe(image2()).pipe(dest("imageMin"));
}

function production(done) {
  return runSequence(
    "concatjs",
    "concatcss",
    "minjs",
    "mincss",
    "copyimg",
    "copyfont",
    "copyhtml",
    "copyjs",
    done
  );
}

function concatt() {
  return src([
    "js/jquery.js",
    "js/slick.js",
    "js/bootstrap.bundle.js",
    "js/bootstrap-datepicker.js",
    "js/bootstrap-datetimepicker.js",
    "js/bootstrap-select.js",
    "js/perfect-scrollbar.js",
    "js/canvasjs.min.js",
    "js/Chart.min.js",
  ])
    .pipe(concat("all.js"))
    .pipe(dest("js"));
}

function concatcss() {
  return src([
    "css/bootstrap.css",
    "css/bootstrap-datepicker.min.css",
    "css/main.css",
    "css/bootstrap-datetimepicker.css",
    "css/perfect-scrollbar.css",
    "css/Chart.min.css",
  ])
    .pipe(concat("all.css"))
    .pipe(dest("css"));
}

function minjs() {
  return src("src/js/all.js").pipe(uglify()).pipe(dest("production/js"));
}

function copyjs() {
  return src("src/js/app.js").pipe(dest("production/js"));
}

function mincss() {
  return src("src/css/all.css").pipe(cleanCSS()).pipe(dest("production/css"));
}

function copyimg() {
  return src("src/images/**/*").pipe(dest("production/images"));
}

function copyfont() {
  return src("src/fonts/**/*").pipe(dest("production/fonts"));
}

function copyhtml() {
  return src("**/*.html").pipe(dest("production"));
}

function cssTask() {
  return src("src/css/global.css")
    .pipe(postcss(PostCssTasks))
    .pipe(cssnano())
    .pipe(dest("src/css/"));
}

exports.serve = serve;
exports.cssBuild = cssTask;
exports.default = serve;

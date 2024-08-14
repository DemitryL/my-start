import gulp from "gulp";
import browserSync from "browser-sync";
import replace from "gulp-replace";
// Css
import dartSass from "sass";
import gulpSass from "gulp-sass";
const sass = gulpSass(dartSass);
import groupCssMedia from "gulp-group-css-media-queries";
import sassGlob from "gulp-sass-glob";
import autoprefixer from "gulp-autoprefixer";
import csso from "gulp-csso";
import webpCss from "gulp-webp-css";
import rename from "gulp-rename";
// Html
import fileInclude from "gulp-file-include";
import pug from "gulp-pug";
import webpHtml from "gulp-webp-html";
import versionNumber from "gulp-version-number";
// Cleaner
import { deleteAsync } from "del";
// Errors
import plumber from "gulp-plumber";
import notify from "gulp-notify";
// Webpack
import webpack from "webpack-stream";
import webpackJs from "./../webpack.config.js";
// Babel
import babel from "gulp-babel";
// image
import imagemin from "gulp-imagemin";
import webp from "gulp-webp";
import imageminWebp from "imagemin-webp";
import extReplace from "gulp-ext-replace";
import changed from "gulp-changed";
// Svg
import svgSprite from "gulp-svg-sprite";

gulp.task("server:docs", function () {
  return browserSync.init({
    server: {
      baseDir: "./docs/",
    },
  });
});

gulp.task("clean:docs", function () {
  return deleteAsync("./docs/");
});

const plumberNotify = (title) => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: "Error <%= error.message %>",
      sound: false,
    }),
  };
};

const fileIncludeSetting = {
  prefix: "@@",
  basepath: "@file",
  context: {
    name: "docs",
  },
};

gulp.task("html:docs", function () {
  return gulp
    .src("./src/*.html")
    .pipe(changed("./docs/"))
    .pipe(plumber(plumberNotify("HTML")))
    .pipe(fileInclude(fileIncludeSetting))
    .pipe(
      replace(
        /(?<=src=|href=|srcset=)(['"])(\.(\.)?\/)*(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
        "$1./$4$5$7$1",
      ),
    )
    .pipe(webpHtml())
    .pipe(
      versionNumber({
        value: "%DT%",
        append: {
          key: "_v",
          cover: 0,
          to: ["css", "js"],
        },
        output: {
          file: "gulp/version.json",
        },
      }),
    )
    .pipe(gulp.dest("./docs/"));
});

gulp.task("pugs:docs", function () {
  return gulp
    .src("./src/pug/*.pug")
    .pipe(changed("./docs/"))
    .pipe(plumber(plumberNotify("HTML")))
    .pipe(
      pug({
        pretty: true,
      }),
    )
    .pipe(webpHtml())
    .pipe(
      versionNumber({
        value: "%DT%",
        append: {
          key: "_v",
          cover: 0,
          to: ["css", "js"],
        },
        output: {
          file: "gulp/version.json",
        },
      }),
    )
    .pipe(gulp.dest("./docs/"));
});

gulp.task("scss:docs", function () {
  return gulp
    .src("./src/scss/*.scss")
    .pipe(changed("./docs/css/"))
    .pipe(plumber(plumberNotify("SCSS")))
    .pipe(
      autoprefixer({
        grid: true,
        cascade: true,
      }),
    )
    .pipe(sassGlob())
    .pipe(webpCss())
    .pipe(groupCssMedia())
    .pipe(sass())
    .pipe(
      replace(
        /(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
        "$1$2$3$4$6$1",
      ),
    )
    .pipe(csso())
    .pipe(
      rename({
        extname: ".min.css",
      }),
    )
    .pipe(gulp.dest("./docs/css/"));
});

gulp.task("libscss:docs", function () {
  return gulp
    .src("./src/scss/libs/**/*")
    .pipe(changed("./docs/css/libs/"))
    .pipe(gulp.dest("./docs/css/libs/"));
});

gulp.task("images:docs", function () {
  return (
    gulp
      .src(["./src/img/**/*", "!./src/img/svgicons/**/*"])
      .pipe(changed("./docs/img/"))
      .pipe(
        imagemin([
          imageminWebp({
            quality: 85,
          }),
        ]),
      )
      .pipe(extReplace(".webp"))
      //.pipe(webp())
      .pipe(gulp.dest("./docs/img/"))
      .pipe(gulp.src("./src/img/**/*"))
      .pipe(changed("./docs/img/"))
      .pipe(
        imagemin(
          [
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 85, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
          ],
          { verbose: true },
        ),
      )
      .pipe(gulp.dest("./docs/img/"))
  );
});

const svgStack = {
  mode: {
    stack: {
      example: true,
    },
  },
};

const svgSymbol = {
  mode: {
    symbol: {
      sprite: "../sprite.symbol.svg",
    },
  },
  shape: {
    transform: [
      {
        svgo: {
          plugins: [
            {
              name: "removeAttrs",
              params: {
                attrs: "(fill|stroke)",
              },
            },
          ],
        },
      },
    ],
  },
};

gulp.task("svgStack:docs", function () {
  return gulp
    .src("./src/img/svgicons/**/*.svg")
    .pipe(plumber(plumberNotify("SVG:dev")))
    .pipe(svgSprite(svgStack))
    .pipe(gulp.dest("./docs/img/svgsprite/"));
});

gulp.task("svgSymbol:docs", function () {
  return gulp
    .src("./src/img/svgicons/**/*.svg")
    .pipe(plumber(plumberNotify("SVG:dev")))
    .pipe(svgSprite(svgSymbol))
    .pipe(gulp.dest("./docs/img/svgsprite/"));
});

gulp.task("fonts:docs", function () {
  return gulp
    .src("./src/fonts/**/*")
    .pipe(changed("./docs/fonts/"))
    .pipe(gulp.dest("./docs/fonts/"));
});

gulp.task("files:docs", function () {
  return gulp
    .src("./src/files/**/*")
    .pipe(changed("./docs/files/"))
    .pipe(gulp.dest("./docs/files/"));
});

gulp.task("js:docs", function () {
  return gulp
    .src("./src/js/*.js")
    .pipe(changed("./docs/js/"))
    .pipe(plumber(plumberNotify("JS")))
    .pipe(babel())
    .pipe(webpack(webpackJs))
    .pipe(gulp.dest("./docs/js/"));
});

gulp.task("libsjs:docs", function () {
  return gulp
    .src("./src/js/libs/**/*")
    .pipe(changed("./docs/js/libs/"))
    .pipe(gulp.dest("./docs/js/libs/"));
});

import gulp from "gulp";
import browserSync from "browser-sync";
// Css
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
const sass = gulpSass(dartSass);
import sassGlob from "gulp-sass-glob";
import rename from "gulp-rename";
// Html
import fileInclude from "gulp-file-include";
import pug from "gulp-pug";
import versionNumber from "gulp-version-number";
// Cleaner
import { deleteAsync } from "del";
// Errors
import plumber from "gulp-plumber";
import notify from "gulp-notify";
// Webpack
import webpack from "webpack-stream";
// Babel
import babel from "gulp-babel";
// image
import imagemin from "gulp-imagemin";
import changed from "gulp-changed";
// and
import replace from "gulp-replace";
import svgsprite from "gulp-svg-sprite";

gulp.task("clean:dev", function () {
  return deleteAsync("./build/");
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

const webpackConfig = {
  mode: "development",

  entry: {
    index: "./src/js/index.js",
    //contacts: "./src/js/contacts.js",
  },

  output: {
    filename: "[name].js",
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};

const fileIncludeSetting = {
  prefix: "@@",
  basepath: "@file",
  context: {
    name: "dev",
  },
};

gulp.task("html:dev", function () {
  return gulp
    .src(["./src/html/**/*.html", "!./src/html/blocks/*.html"])
    .pipe(changed("./build/"))
    .pipe(plumber(plumberNotify("HTML")))
    .pipe(fileInclude(fileIncludeSetting))
    .pipe(
      replace(
        /(?<=src=|href=|srcset=)(['"])(\.(\.)?\/)*(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
        "$1./$4$5$7$1",
      ),
    )
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
    .pipe(gulp.dest("./build/"));
});

gulp.task("pugs:dev", function () {
  return gulp
    .src("./src/pug/*.pug")
    .pipe(changed("./build/"))
    .pipe(plumber(plumberNotify("HTML")))
    .pipe(
      pug({
        pretty: true,
      }),
    )
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
    .pipe(gulp.dest("./build/"));
});

gulp.task("scss:dev", function () {
  return gulp
    .src("./src/scss/*.scss", { sourcemaps: true })
    .pipe(changed("./build/css/"))
    .pipe(plumber(plumberNotify("SCSS")))
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(
      replace(
        /(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
        "$1$2$3$4$6$1",
      ),
    )
    .pipe(
      rename({
        extname: ".css",
      }),
    )
    .pipe(gulp.dest("./build/css/", { sourcemaps: true }));
});

gulp.task("libscss:dev", function () {
  return gulp
    .src("./src/scss/libs/**/*")
    .pipe(changed("./build/css/libs/"))
    .pipe(gulp.dest("./build/css/libs/"));
});

gulp.task("images:dev", function () {
  return gulp
    .src(["./src/img/**/*", "!./src/img/svgicons/**/*"])
    .pipe(changed("./build/img/"))
    .pipe(imagemin({ verbose: true }))
    .pipe(gulp.dest("./build/img/"));
});

const svgStack = {
  mode: {
    stack: {
      example: true,
    },
  },
  shape: {
    transform: [
      {
        svgo: {
          js2svg: { indent: 4, pretty: true },
        },
      },
    ],
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
          js2svg: { indent: 4, pretty: true },
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

gulp.task("svgStack:dev", function () {
  return gulp
    .src("./src/img/svgicons/**/*.svg")
    .pipe(plumber(plumberNotify("SVG:dev")))
    .pipe(svgsprite(svgStack))
    .pipe(gulp.dest("./build/img/svgsprite/"));
});

gulp.task("svgSymbol:dev", function () {
  return gulp
    .src("./src/img/svgicons/**/*.svg")
    .pipe(plumber(plumberNotify("SVG:dev")))
    .pipe(svgsprite(svgSymbol))
    .pipe(gulp.dest("./build/img/svgsprite/"));
});

gulp.task("fonts:dev", function () {
  return gulp
    .src("./src/fonts/**/*")
    .pipe(changed("./build/fonts/"))
    .pipe(gulp.dest("./build/fonts/"));
});

gulp.task("files:dev", function () {
  return gulp
    .src("./src/files/**/*")
    .pipe(changed("./build/files/"))
    .pipe(gulp.dest("./build/files/"));
});

gulp.task("js:dev", function () {
  return (
    gulp
      .src("./src/js/*.js")
      .pipe(changed("./build/js/"))
      .pipe(plumber(plumberNotify("JS")))
      //.pipe(babel())
      .pipe(webpack(webpackConfig))
      .pipe(gulp.dest("./build/js/"))
  );
});

gulp.task("libsjs:dev", function () {
  return gulp
    .src("./src/js/libs/**/*")
    .pipe(changed("./build/js/libs/"))
    .pipe(gulp.dest("./build/js/libs/"));
});

gulp.task("server:dev", function () {
  return browserSync.init({
    server: {
      baseDir: "./build/",
    },
  });
});

gulp.task("watch:dev", function () {
  gulp
    .watch("./src/scss/**/*.scss", gulp.parallel("scss:dev"))
    .on("all", browserSync.reload);
  gulp
    .watch("./src/scss/libs/**/*", gulp.parallel("libscss:dev"))
    .on("all", browserSync.reload);
  gulp
    .watch("./src/**/*.html", gulp.parallel("html:dev"))
    .on("all", browserSync.reload);
  gulp
    .watch("./src/pug/**/*.pug", gulp.parallel("pugs:dev"))
    .on("all", browserSync.reload);
  gulp
    .watch("./src/img/**/*", gulp.parallel("images:dev"))
    .on("all", browserSync.reload);
  gulp
    .watch("./src/fonts/**/*", gulp.parallel("fonts:dev"))
    .on("all", browserSync.reload);
  gulp
    .watch("./src/files/**/*", gulp.parallel("files:dev"))
    .on("all", browserSync.reload);
  gulp
    .watch("./src/js/**/*.js", gulp.parallel("js:dev"))
    .on("all", browserSync.reload);
  gulp
    .watch("./src/js/libs/**/*", gulp.parallel("libsjs:dev"))
    .on("all", browserSync.reload);
  gulp.watch(
    "./src/img/svgicons/*",
    gulp.series("svgStack:dev", "svgSymbol:dev"),
  );
});

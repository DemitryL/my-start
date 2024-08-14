import gulp from "gulp";
// Tasks
import "./gulp/dev.js";
import "./gulp/docs.js";

gulp.task(
  "default",
  gulp.series(
    "clean:dev",
    gulp.parallel(
      "html:dev",
      "scss:dev",
      "libscss:dev",
      "images:dev",
      gulp.series("svgStack:dev", "svgSymbol:dev"),
      "fonts:dev",
      "files:dev",
      "js:dev",
      "libsjs:dev",
    ),
    gulp.parallel("server:dev", "watch:dev"),
  ),
);

gulp.task(
  "docs",
  gulp.series(
    "clean:docs",
    gulp.parallel(
      "pugs:docs",
      "scss:docs",
      "images:docs",
      gulp.series("svgStack:dev", "svgSymbol:dev"),
      "fonts:docs",
      "files:docs",
      "js:docs",
    ),
    gulp.parallel("server:docs"),
  ),
);

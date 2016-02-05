var gulp = require('gulp');
var browserSync = require('browser-sync');

gulp.task('default', ['serve']);

gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: "./",
        routes: {
            "/oidc-angular.js": "../oidc-angular.js"
        }        
        },

        open: false
    });
    
    gulp.watch(["*.*", '../*.js']).on('change', browserSync.reload);
});

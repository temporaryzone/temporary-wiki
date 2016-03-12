// kirby cms config - 19. 2. 2016


var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('autoprefixer');
var concat = require('gulp-concat');
var browserSync = require('browser-sync');
var connect = require('gulp-connect-php');
var sourcemaps = require('gulp-sourcemaps');
var reload = browserSync.reload;
var cssnano = require('cssnano');
var postcss = require('gulp-postcss');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var debug = require('gulp-debug');
var cache = require('gulp-cached');
var rename = require('gulp-rename');
var order = require('gulp-order');
var log = gutil.log;
var c = gutil.colors;
var run = require('gulp-run');
var cssnext = require("postcss-cssnext");
var lost = require('lost');
 
// CONFIG
var siteroot = 'website';
var devroot = '';
var themename = '';
var themeroot = siteroot + '/assets/' + themename;
var scriptorder = [
	    "enquire.js",
	    "jquery.js",
	    "magnific-popup.js",
	    "velocity.js",
	    "fluidvids.js",
	    "smooth-scroll.js",
	    "main.js",
	  ];
var processors = [
        autoprefixer({browsers: ['last 1 version']}),
        cssnext(),
        lost(),
    ];
var miniprocessors = [
        autoprefixer({browsers: ['last 1 version']}),
        cssnext(),
        lost(),
        cssnano
    ];





// funkce co se pousti kdyz je eror v kompilaci gutil.beep() je zvuk, kdyztak vykomentovat
var onError = function (err) {  
  gutil.beep();
  console.log(err);
};


gulp.task('browser-sync',['connect'], function() {
    browserSync({
      proxy: '127.0.0.1:8020',
      port: 8080,
      open: true,
      browser: "google chrome canary",
      notify: false
    }, function (err, bs) {
    	 if (err) { console.log(err); }
		    if (!err) {
		        console.log("BrowserSync is ready!");
		    }
	});
});


gulp.task('bs-reload', function() {
	reload();
});


gulp.task('connect', function(cb) {
    connect.server({ base: siteroot, port: 8020, stdio: 'ignore'}, 
    function() {
    	console.log('PHP server initialized, starting BrowserSync');
    	cb();
    });
});




gulp.task('compile',  ['justsass'], function () {
  run('wget --mirror -p --trust-server-names --adjust-extension --convert-links -P ./devstuff/compiled 127.0.0.1:8020').exec()  
    .pipe(gulp.dest(''))  
})






 
/// critical css


gulp.task('criticalcss', ['justsass'],function (cb) {
    critical.generate({
    // inline: true,
    base: './devstuff/',
    src: 'compiled/127.0.0.1:8020/cz.html',
    // dest: './devstuff/css/critical.html',
    dest: './devstuff/css/critical.css',
    css: ['./devstuff/css/main.css'],
    width: 1300,
    minify: true,
    height: 900,
	}, cb.bind(cb));
});


/// end critical css


gulp.task('copycritical', function () {
	gulp.src('./devstuff/css/critical.css')
	.pipe(gulp.dest(themeroot + '/css'))
});



// sass
gulp.task('sass', function() {
		gulp.src('sass/main.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({
		      outputStyle: 'expanded',
		      onSuccess: function(css) {
		        var dest = css.stats.entry.split('/');
		        log(c.green('sass'), 'compiled to', dest[dest.length - 1]);
		      },
		      onError: function(err, res) {
		        log(c.red('Sass failed to compile'));
		        log(c.red('> ') + err.file.split('/')[err.file.split('/').length - 1] + ' ' + c.underline('line ' + err.line) + ': ' + err.message);
		      }
		    }).on('error', sass.logError))
		.pipe(postcss(processors))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(themeroot + '/css'))
		.pipe(reload({stream:true}));
	});



gulp.task('justsass', function() {
		gulp.src(devroot + '/sass/main.scss')
		.pipe(sass({
		      outputStyle: 'expanded',
		      onSuccess: function(css) {
		        var dest = css.stats.entry.split('/');
		        log(c.green('sass'), 'compiled to', dest[dest.length - 1]);
		      },
		      onError: function(err, res) {
		        log(c.red('Sass failed to compile'));
		        log(c.red('> ') + err.file.split('/')[err.file.split('/').length - 1] + ' ' + c.underline('line ' + err.line) + ': ' + err.message);
		      }
		    }))
		.pipe(postcss(processors))
		.pipe(gulp.dest('./devstuff/css'));
	});


gulp.task('minisass', function() {
		gulp.src('sass/main.scss')
		.pipe(sass({
		      outputStyle: 'expanded',
		      onSuccess: function(css) {
		        var dest = css.stats.entry.split('/');
		        log(c.green('sass'), 'compiled to', dest[dest.length - 1]);
		      },
		      onError: function(err, res) {
		        log(c.red('Sass failed to compile'));
		        log(c.red('> ') + err.file.split('/')[err.file.split('/').length - 1] + ' ' + c.underline('line ' + err.line) + ': ' + err.message);
		      }
		    }))
		.pipe(postcss(miniprocessors))
		.pipe(gulp.dest(themeroot + '/css'));
	});



gulp.task('megakill', ['criticalcss', 'minijs'], function() {
	return gulp.src('./devstuff/css/*.css')
	.pipe(postcss(miniprocessors))
	.pipe(gulp.dest(themeroot + '/css'));
});



gulp.task('movecs', function() {
	return gulp.src('./devstuff/css/*.css')
	// .pipe(postcss(miniprocessors))
	.pipe(gulp.dest(themeroot + '/css'));
});


gulp.task('minijs', function() {
	return  gulp.src('js/*.js')
	.pipe(order(scriptorder))
	.pipe(concat('main.js')) // spojeni vseho do main.js
    .pipe(uglify())
	.pipe(gulp.dest(siteroot + '/assets/js'));
});

gulp.task('script', function() {
	return  gulp.src('js/*.js')
	.pipe(order(scriptorder))
   	.pipe(concat('main.js')) // spojeni vseho do main.js
	.pipe(gulp.dest(siteroot + '/assets/js'))        
	.pipe(reload({stream:true}));;
});







gulp.task('default', ['browser-sync','sass'], function () {
	gulp.watch(['js/*.js'], ['script']);
	gulp.watch(['sass/main.scss'], ['sass']);
	// gulp.watch([devroot + '/theme/**/*'], ['themewatch', 'bs-reload']); // pro grav
	gulp.watch([themeroot + '/*.php',siteroot + '/site/**/*.php'], ['bs-reload']); // pro kirbyho
});

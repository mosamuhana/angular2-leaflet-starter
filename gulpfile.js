require('./tools/register_extensions');

const path        = require('path');
const fs          = require('fs-extra');
const gulp        = require('gulp');
const template    = require('gulp-template');
const gzip        = require('gulp-gzip');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync');

const DIST = 'dist';
const SRC = 'src';

require('./tools/libs/assets.js');

function subscribe(observable, done, showInfo = true) {
	observable
		.subscribe(data => {
			if (showInfo) console.info(data);
		}, err => {
			throw new Error(err);
		}, () => {
			done();
		});
}

gulp.task('clean', done => {
	fs.remove(DIST, err => {
		done(err);
	});
});

gulp.task('copy-public', done => {
	return gulp
		.src([SRC + '/public/*'])
		.pipe(gulp.dest(DIST));
});

function html(isProd) {
	return gulp
		.src(SRC + '/index.html')
		.pipe(template({
			title: 'My App: ' + (isProd ? '' : 'dev'),
			styles: isProd ? ['css/styles.min.css'] : ['css/styles.css'],
			scripts: isProd ? ['js/leaflet.js', 'app.js'] : ['js/leaflet.js', 'vendor.js', 'main.js']
		}))
		.pipe(gulp.dest(DIST));
}

gulp.task('html:dev', done => {
	return html(false);
});

gulp.task('html:prod', done => {
	return html(true);
});

gulp.task('build:main', done => {
	const Builder = require('./tools/libs/build-dev.ts').Builder;
	let builder = new Builder();
	subscribe(builder.buildMain(), done, false);
});

gulp.task('build:vendor', done => {
	const Builder = require('./tools/libs/build-dev.ts').Builder;
	let builder = new Builder();
	subscribe(builder.buildVendor(), done, false);
});

gulp.task('build:dev', ['build:main', 'build:vendor']);

gulp.task('build:prod', done => {
	const Builder = require('./tools/libs/build-prod.ts').Builder;
	let builder = new Builder();
	subscribe(builder.build(), () => {
		fs.removeSync(DIST + '/src');
		fs.removeSync('aot');
		done();
	});
});

gulp.task('gzip', done => {
	return gulp
		.src(DIST + '/app.js')
		.pipe(gzip({ append: true, level: 9 }))
		.pipe(gulp.dest(DIST));
});

gulp.task('dev', done => {
	runSequence(['copy-public', 'assets:dev', 'html:dev', 'build:dev'], done);
});

gulp.task('prod', done => {
	runSequence('clean', ['copy-public', 'assets:prod', 'html:prod', 'build:prod'], 'gzip');
});


gulp.task('browse', () => {
	browserSync.init({
		//port: 3000,
		//browser: 'chrome',
		notify: false,
		server: DIST, //path.resolve(__dirname, '../../dist'),
		files: [DIST + '/**/*'],
		middleware: [
			require('connect-history-api-fallback')({
				index: '/index.html'
			})
		]
	});
});

gulp.task('watch', () => {
	gulp.watch([SRC + '/app/**/*', SRC + '/main.ts'], ['build:main']);
	gulp.watch([SRC + '/styles/**/*', 'public/css/*'], ['merge-css:dev']);
	gulp.watch(SRC + '/index.html', ['html:dev']);
});

gulp.task('serve', () => {
	if (fs.existsSync(DIST)) {
		runSequence(['browse', 'watch']);
	} else {
		runSequence('dev', ['browse', 'watch']);
	}
});

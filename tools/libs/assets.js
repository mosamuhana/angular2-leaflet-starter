const gulp        = require('gulp');
const sass        = require('gulp-sass');
const gulpIf      = require('gulp-if');
const rename      = require('gulp-rename');
const concat      = require('gulp-concat');
const cleanCss    = require('gulp-clean-css');
const gulpOrder   = require('gulp-order');
const mergeStream = require('merge-stream');

const DIST = 'dist';
const SRC = 'src';

const cleanCssOptions = {
	keepSpecialComments: 0,
	mediaMerging: false
};

function vendorCss(isProd) {
	return gulp
		.src([
			'node_modules/bootstrap/dist/css/bootstrap.css',
			'node_modules/font-awesome/css/font-awesome.css',
			'node_modules/leaflet/dist/leaflet.css',
			SRC + 'css/**/*.css'
		])
		.pipe(concat('vendor.css'))
		.pipe(gulpIf(isProd, cleanCss(cleanCssOptions)))
}

function appSass(isProd) {
	return gulp
		.src(SRC + '/styles/app.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(rename('app.css'))
		.pipe(gulpIf(isProd, cleanCss(cleanCssOptions)))
}

function mergeCss(isProd) {
	const fileName = 'styles' + (isProd ? '.min' : '') + '.css';

	let stream = mergeStream();
	stream.add(appSass(isProd));
	stream.add(vendorCss(isProd));

	return stream
		.pipe(gulpOrder([
			'vendor.css',
			'app.css'
		]))
		.pipe(concat(fileName))
		.pipe(gulp.dest(DIST + '/css'));
}

gulp.task('merge-css:dev', done => {
	return mergeCss(false);
});

gulp.task('merge-css:prod', done => {
	return mergeCss(true);
});

gulp.task('copy-resources', done => {
	var stream = mergeStream();

	// copy leaflet style images
	stream.add(
		gulp
			.src(
				[
					'layers.png',
					'layers-2x.png',
					'marker-icon.png'
				].map(x => `node_modules/leaflet/dist/images/${x}`)
			)
			.pipe(gulp.dest(DIST + '/css/images'))
	);

	// copy all images
	stream.add(
		gulp
			.src('node_modules/leaflet/dist/images/**/*')
			.pipe(gulp.dest(DIST + '/images'))
	);

	// copy bootstrap fonts
	stream.add(
		gulp
			.src('node_modules/bootstrap/dist/fonts/**/*')
			.pipe(gulp.dest(DIST + '/fonts'))
	);

	// copy font-awesome fonts
	stream.add(
		gulp
			.src('node_modules/font-awesome/fonts/**/*')
			.pipe(gulp.dest(DIST + '/fonts'))
	);

	// copy leaflet js
	stream.add(
		gulp
			.src('node_modules/leaflet/dist/leaflet.js')
			.pipe(gulp.dest(DIST + '/js'))
	);

	return stream;
});

gulp.task('assets:dev', ['copy-resources', 'merge-css:dev']);

gulp.task('assets:prod', ['copy-resources', 'merge-css:prod']);

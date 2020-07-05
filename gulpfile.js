// CONSTANTS
const PARTIALS_DIR_PATH = './src/partials';
const TAILWIND_CONFIG = 'tailwind.config.js';

const OUTPUT_DIR_NAME = 'dist';
const OUTPUT_CSS_FILE_NAME = 'main.css';
const OUTPUT_JS_FILE_NAME = 'main.js';
const OUTPUT_JS_DIR_NAME = 'js';
const OUTPUT_IMG_DIR_NAME = 'img';
const OUTPUT_ASSETS_DIR_NAME = 'assets';

const STYLES_FILES = ['src/**/*.css'];
const SCRIPTS_FILES = ['src/**/*.js'];
const IMG_FILES = ['src/img/**/*'];
const HTML_FILES = ['src/*.html'];
const ASSETS_FILES = ['src/assets/**/*'];

// SETTINGS
const { watch, series, parallel, src, dest } = require('gulp');
const del = require('del');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');
const cssnano = require('cssnano');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const fileinclude = require('gulp-file-include');

const isSync = process.argv.includes('--sync');

function clear() {
  return del(OUTPUT_DIR_NAME + '/*');
}

function stylesDev() {
  const processors = [tailwindcss(TAILWIND_CONFIG)];

  return src(STYLES_FILES)
    .pipe(sourcemaps.init())
    .pipe(concat(OUTPUT_CSS_FILE_NAME))
    .pipe(postcss(processors))
    .pipe(sourcemaps.write())
    .pipe(dest(OUTPUT_DIR_NAME))
    .pipe(gulpif(isSync, browserSync.stream()));
}

function stylesProd() {
  const processors = [tailwindcss(TAILWIND_CONFIG), autoprefixer, cssnano];

  return src(STYLES_FILES)
    .pipe(concat(OUTPUT_CSS_FILE_NAME))
    .pipe(postcss(processors))
    .pipe(dest(OUTPUT_DIR_NAME));
}

function scriptsDev() {
  return src(SCRIPTS_FILES)
    .pipe(sourcemaps.init())
    .pipe(concat(OUTPUT_JS_FILE_NAME))
    .pipe(sourcemaps.write())
    .pipe(dest(OUTPUT_DIR_NAME + '/' + OUTPUT_JS_DIR_NAME))
    .pipe(gulpif(isSync, browserSync.stream()));
}

function scriptsProd() {
  return src(SCRIPTS_FILES)
    .pipe(concat(OUTPUT_JS_FILE_NAME))
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(uglify())
    .pipe(dest(OUTPUT_DIR_NAME + '/' + OUTPUT_JS_DIR_NAME));
}

function img() {
  return src(IMG_FILES).pipe(dest(OUTPUT_DIR_NAME + '/' + OUTPUT_IMG_DIR_NAME));
}

function html() {
  return src(HTML_FILES)
    .pipe(fileinclude({ basepath: PARTIALS_DIR_PATH }))
    .pipe(dest(OUTPUT_DIR_NAME))
    .pipe(gulpif(isSync, browserSync.stream()));
}

function assets() {
  return src(ASSETS_FILES).pipe(dest(OUTPUT_DIR_NAME + '/' + OUTPUT_ASSETS_DIR_NAME));
}

const dev = series(clear, parallel(stylesDev, scriptsDev, img, html, assets));
const build = series(clear, parallel(stylesProd, scriptsProd, img, html, assets));

function watcher() {
  if (isSync) {
    browserSync.init({
      server: {
        baseDir: OUTPUT_DIR_NAME,
      },
      // tunnel: true
    });
  }

  watch(STYLES_FILES, stylesDev);
  watch(SCRIPTS_FILES, scriptsDev);
  watch(IMG_FILES, img);
  watch(HTML_FILES.concat([PARTIALS_DIR_PATH + '/**/*']), html);
  watch(ASSETS_FILES, assets);
}

exports.default = build;
exports.dev = series(dev, watcher);

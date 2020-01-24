const {
  dest,
  src,
  series,
  watch
} = require('gulp')

const cleanup = require('del')
const srcmap = require('gulp-sourcemaps')
const sass = require('gulp-sass')
const eslint = require('gulp-eslint')
const commnt = require('gulp-header-comment')
const webpack = require('webpack-stream')
const include = require('gulp-file-include')
const browserSync = require('browser-sync').create()
const webpackConfig = require('./webpack.config.js')

sass.compiler = require('node-sass')

const config = {
  base: './src',
  dist: process.env.DIST || './dist',
  css: [
    './src/scss/**/*.{sass,scss}'
  ],
  js: [
    './src/js/**/*.js',
    '!./src/js/worker.js'
  ],
  assets: './src/**/*.{ico,jpg,php,png,pot,svg,txt,webmanifest}',
  html: './src/**/*.html',
  worker: './src/js/worker.js'
}

const theme = `

<%= pkg.name %> - <%= pkg.version %>
<%= pkg.description %>
<%= pkg.author %> - https://pongstr.io/
`

/**
 * @private
 * @const clean
 * @desc
 *  cleans the build directory before creating a new build
 * @returns {Callback}
 * @since 0.1.0
 */
const clean = () => cleanup(config.dist)

/**
 * @private
 * @const css
 * @desc
 *    gulp css task, this task is mainly utilized for development
 *    as it does not minify the final output.
 *
 * @returns {Callback}
 * @since 0.1.0
*/
const css = function (done) {
  const { css, dist } = config
  const options = {
    outputStyle: 'expanded',
    // indentedSyntax: true,
    includePaths: [
      './src/scss',
      'node_modules/bootstrap/scss'
    ]
  }
  src(css)
    .pipe(sass.sync(options).on('error', sass.logError))
    .pipe(commnt(theme))
    .pipe(dest(dist))
  return done()
}

/**
 * @public
 * @const cssmin
 * @desc
 *    gulp js task, this task is mainly utilized for development and/or for final
 *    production build as it minifies and creates source maps.
 *
 * @example
 *  ```bash
 *  $ npm run build:css
 * ```
 *
 * @returns {Callback}
 * @since 0.1.0
*/
const cssmin = function (done) {
  const { css, dist } = config
  const options = {
    outputStyle: 'expanded',
    // indentedSyntax: true,
    includePaths: [
      './src/scss',
      'node_modules/bootstrap/scss'
    ]
  }
  src(css)
    .pipe(sass.sync(options).on('error', sass.logError))
    .pipe(srcmap.init())
    .pipe(commnt(theme))
    .pipe(srcmap.write('.'))
    .pipe(dest(dist))
  return done()
}

/**
 * @private
 * @const js
 * @desc
 *    gulp js task, this task is mainly utilized for development
 *    as it does not minify the final output.
 *
 * @returns {Callback}
 * @since 0.1.0
*/
const js = function (done) {
  const { base, dist, js } = config
  src(js, { base })
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(webpack(webpackConfig))
    .pipe(dest(dist))
  return done()
}

/**
 * @public
 * @const jsmin
 * @desc
 *    gulp js task, this task is mainly utilized for development and/or for final
 *    production build as it minifies and creates source maps.
 *
 * @example
 *  ```bash
 *  $ npm run build:js
 * ```
 *
 * @returns {Callback}
 * @since 0.1.0
*/
const jsmin = function (done) {
  const { dist, js } = config
  src(js)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
    .pipe(webpack(webpackConfig))
    .pipe(dest(dist))
  return done()
}

/**
 * @public
 * @const assets
 * @desc
 *  gulp task that copies php and pot files utilized for the wordpress theme. this
 *  task does not process and/or do anything else but copy (the more you know).
 *
 * @example
 *  ```bash
 *  $ npm run build:assets
 * ```
 *
 * @param {Callback} done
 *
 * @returns {Callback}
 * @since 0.1.0
 */
const _assets = function (done) {
  const { base, dist, assets } = config
  src(assets, { base }).pipe(dest(dist))
  return done()
}

/**
 * @public
 * @const worker
 * @desc
 *  gulp tasks that builds service worker
 * @example
 *  ```bash
 *  $ npm run build:worker
 * ```
 */
const worker = function (done) {
  const { dist, worker } = config
  src(worker).pipe(dest(dist))
  return done()
}

/**
 * @public
 * @const html
 * @desc
 *  gulp tasks that builds html files
 * @example
 *  ```bash
 *  $ npm run build:html
 * ```
 */
const html = function (done) {
  const { dist, html, base } = config
  src(html, { base })
    .pipe(include({
      prefix: '@@',
      basePath: base,
      context: {
        env: process.env.NODE_ENV || 'development'
      }
    }))
    .pipe(dest(dist))
  return done()
}

/**npm
 * @public
 * @const browserSync
 * @desc
 *  gulp tasks that hot-reloads page output
 * @example
 *  ```bash
 *  $ npm run build:sync
 * ```
 */
const sync = function (done) {
  browserSync.init({
    watch: true,
    server: config.dist,
    browser: 'google chrome',
    xip: false,
    port: 3000,
    notify: false
  })

  watch(config.js, js)
  watch(config.worker, worker)
  watch(config.assets, { read: false }, _assets)
  watch(config.css, css)
  watch(config.html, html)
  watch(`${config.dist}/**/*.html`).on('change', browserSync.reload)
  done()
}

/**
 * @public
 * @const dev
 * @desc
 *  gulp task that watches files inside the `config.base` directory and executes
 *  the tasks accordingly.
 *
 * @example
 *  ```bash
 *  $ npm run build:watch
 * ```
 *
 * @param {Callback} done
 *
 * @returns {Callback}
 * @since 0.1.0
 */
const dev = function (done) { // eslint-disable-line
  watch(config.js, js)
  watch(config.html, html)
  watch(config.worker, worker)
  watch(config.assets, { read: false }, _assets)
  watch(config.css, css)
  return done()
}

/**
 * @public
 * @const _default
 * @desc
 *  this executes all tasks required for a production build.
 *
 * @example
 *  ```bash
 *  $ npm run build
 * ```
 *
 * @returns {series} - returns gulp task series
 * @since 0.1.0
 */
const _default = series(
  clean,
  cssmin,
  jsmin,
  html,
  worker,
  _assets
)

exports.css = cssmin
exports.js = jsmin
exports.assets = _assets
exports.html = html
exports.dev = series(_default, sync)
exports.default = _default

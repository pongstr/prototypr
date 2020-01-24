module.exports = {
  base: './src',
  dist: process.env.DIST || './dist',
  assets: './src/**/*.{ico,jpg,php,png,pot,svg,txt,webmanifest}',
  css: [
    './src/scss/**/*.{scss}'
  ],
  js: [
    './src/js/**/*.js'
  ],
  html: [
    './src/**/*.html',
    '!./src/templates/*.html',
    '!./src/includes/*.html',
  ],
  worker: './src/js/worker.js'
}

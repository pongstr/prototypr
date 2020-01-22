const { resolve, join } = require('path');
const outputDir = resolve(__dirname, 'dist');

module.exports = {
  mode: process.env.NODE_ENV || 'production',
  entry: {
    'app.main': resolve(__dirname, 'src/js/main.js'),
    'app.vendor': resolve(__dirname, 'src/js/vendor.js')
  },
  output: {
    path: outputDir,
    filename: 'js/[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  resolveLoader: {
    modules: ['node_modules'],
    extensions: ['.js', '.json'],
    mainFields: ['loader', 'main']
  },
  externals: {
    jquery: 'jQuery',
    popper: 'popper.js'
  }
};

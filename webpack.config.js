const path = require('path');

module.exports = {
  // The entry point file described above
  entry: {
    editor: ['./public/js/src/editor.js']
    // demo: ['./public/js/src/splash.js', './public/js/src/demo.js'],
    // splash: ['./public/js/src/splash.js']
  },
  // The location of the build folder described above
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '/public/js/dist/'),
  },
  mode: "development",
  // Optional and for development only. This provides the ability to
  // map the built code back to the original source format when debugging.
  devtool: 'eval-source-map',
};
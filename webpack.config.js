const webpack = require('webpack');
const path = require('path');

const debug = process.env.NODE_ENV !== 'production';

module.exports = {
  context: __dirname,
  devtool: debug ? 'inline-sourcemap' : false,
  entry: [
    // 'script-loader!jquery/dist/jquery.min.js',
    './public/js/main.js'
  ],
  // externals: {
  //   jquery: 'jQuery'
  // },
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: 'bundle.min.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
    // new webpack.ProvidePlugin({
    //   $: 'jquery',
    //   jQuery: 'jquery',
    //   'window.jQuery': 'jquery',
    //   'window.$': 'jquery'
    // }),
    new webpack.optimize.OccurrenceOrderPlugin(),
  ],
};

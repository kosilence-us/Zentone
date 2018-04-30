const webpack = require('webpack');
const path = require('path');

const debug = process.env.NODE_ENV !== 'production';

module.exports = {
  context: __dirname,
  devtool: debug ? 'inline-sourcemap' : false,
  entry: [
    'script-loader!jquery/dist/jquery.min.js',
    './public/js/main.js'
    // './public/css/imports.scss'
  ],
  externals: {
    jquery: 'jQuery'
  },
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: 'bundle.min.js'
  },
  // module: {
  //   rules: [
  //     {
  //       test: /\.(sass|scss)$/,
  //       use: [{
  //         loader: 'style-loader'
  //       }, {
  //         loader: 'css-loader'
  //       }, {
  //         loader: 'sass-loader',
  //         options: {
  //           includePaths: [
  //             path.resolve(__dirname, './public/css')
  //           ]
  //         }
  //       }]
  //     }, {
  //       test: /\.css$/,
  //       use: {
  //         loader: 'style-loader!css-loader'
  //       }
  //     }, {
  //       test: /\.png$/,
  //       use: {
  //         loader: 'url-loader?limit=100000'
  //       }
  //     }, {
  //       test: /\.jpg$/,
  //       use: {
  //         loader: 'file-loader'
  //       }
  //     }, {
  //       test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
  //       use: {
  //         loader: 'url-loader?limit=10000&mimetype=application/font-woff'
  //       }
  //     }, {
  //       test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
  //       use: {
  //         loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
  //       }
  //     }, {
  //       test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
  //       use: {
  //         loader: 'file-loader'
  //       }
  //     }, {
  //       test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
  //       use: {
  //         loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
  //       }
  //     }
  //   ]
  // },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery'
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    // new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};

const path = require('path');
const webpack = require('../../frontend/node_modules/webpack');
module.exports = {
  mode: 'development', entry: path.resolve(__dirname, 'entry.js'),
  output: { path: '/tmp/ecos-validation', filename: 'validation.js', publicPath: '/' },
  resolve: { modules: [path.resolve(__dirname, '../../frontend/node_modules'), 'node_modules'] },
  plugins: [new webpack.DefinePlugin({ 'process.env.REACT_APP_CONTACT_ENDPOINT': JSON.stringify('') })],
  devtool: false,
};

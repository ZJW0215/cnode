const path = require('path');
const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const baseConfig = require('./webpack.base')

module.exports = webpackMerge(baseConfig, {
  target: 'node',
  entry: {
    app: path.join(__dirname, "../client/server-entry.js")
  },
  /* 在server-entry打包时引用的node_modules包都不打包到整个环境的js文件中 */
  externals:Object.keys(require('../package.json').dependencies),
  output: {
    filename: 'server-entry.js',
    libraryTarget: 'commonjs2'
  },
  plugins:[
    new webpack.DefinePlugin({
      'process.env.API_BASE':'"http://127.0.0.1:3333"',
    })
  ],
})

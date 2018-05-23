const path = require('path')
const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const baseConfig = require('./webpack.base')
const HTMLPlugin = require('html-webpack-plugin')
const NameAllModulesPlugin = require('name-all-modules-plugin')

const isDev = process.env.NODE_ENV === 'development'

const config = webpackMerge(baseConfig, {
  entry: {
    app: path.join(__dirname, "../client/app.js")
  },
  output: {
    filename: '[name].[hash].js',
  },
  /*生成html页面同时将前面的entry注入到html页面中，路径、名字都是配置中的*/
  plugins: [
    new HTMLPlugin({
      template: path.join(__dirname, '../client/template.html')
    }),
    new HTMLPlugin({
      template: '!!ejs-compiled-loader!' + path.join(__dirname, '../client/server.template.ejs'),
      filename: 'server.ejs'
    })
  ]
})

if (isDev) {
  /* devTool使得网页调试的时候调试的是源代码而不是编译后的代码 */
  config.devtool = '#cheap-module-eval-source-map'
  config.entry = {
    app: [
      'react-hot-loader/patch',
      path.join(__dirname, '../client/app.js')
    ]
  }
  config.devServer = {
    host: '0.0.0.0',   //这样设置就可以以任何方式访问
    compress: true,
    port: '8888',
    // contentBase: path.join(__dirname, '../dist'),
    hot: true,
    overlay: {
      errors: true
    },
    publicPath: '/public/',
    historyApiFallback: {
      index: '/public/index.html'
    },
    proxy: {
      '/api': 'http://localhost:3333'
    }
  }
  config.plugins.push(new webpack.HotModuleReplacementPlugin())
} else {
  config.entry = {
    app: path.join(__dirname, '../client/app.js'),
    vendor: [
      'react',
      'react-dom',
      'axios',
      'mobx',
      'mobx-react',
      'react-router-dom',
      'query-string',
      'marked',
      'dateformat',
    ],
  }
  config.output.filename = '[name].[chunkhash].js'
  config.optimization = {
	  splitChunks: {
      chunks: "async",
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        commons: {
          name: "vendor",
          chunks: "initial",
          minChunks: 2,
        },
      },
	  },
    splitChunks: {
      chunks: "async",
      minChunks: Infinity,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        commons: {
          name: "manifest",
          chunks: "initial",
          minChunks: 2,
        },
      },
    }
  }
  config.plugins.push(
    new webpack.NamedModulesPlugin(),
    new NameAllModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new webpack.NamedChunksPlugin((chunk) => {
      if (chunk.name) {
        return chunk.name
      }
      return chunk.mapModules(m => path.relative(m.context, m.request)).join('_')
    })
  )
}

module.exports = config;

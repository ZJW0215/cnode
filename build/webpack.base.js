const path = require('path')
module.exports = {
  output:{
    path: path.join(__dirname, '../dist'),
    publicPath: '/public/',   //添加public是为了区分要处理的文件
  },
  resolve:{
    extensions:['.js','.jsx']
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /(.js|jsx)$/,
        loader: 'eslint-loader',
        exclude: [
          path.resolve(__dirname, '../node_modules')
        ]
      },
      {
        test: /.jsx$/,
        loader: 'babel-loader'
      },
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: [
          path.join(__dirname, '../node_modules')
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?hash'
        }
      }
    ]
  }
}

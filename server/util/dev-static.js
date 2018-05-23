/* http请求工具 */
const axios = require('axios')
const path = require('path')
/* 虚拟磁盘 */
const MemoryFs = require('memory-fs')

const webpack = require('webpack')

/* 跨域http请求代理 */
const proxy = require('http-proxy-middleware')

const serverConfig = require('../../build/webpack.config.server')

const serverRender = require('./server-render')

/* 获取HTML模板 */
const getTemplate = () => {
  return new Promise((resolve, reject) => {
    axios.get('http://localhost:8888/public/server.ejs')
      .then(res => {
        resolve(res.data)
      })
      .catch(reject)
  })
}

const NativeModule = require('module')
const vm = require('vm')

/* 从node_modules中引用相关的包 */
const getModuleFromString = (bundle, filename) => {
  const m = {exports: {}}
  const wrapper = NativeModule.wrap(bundle)
  const script = new vm.Script(wrapper, {
    filename: filename,
    displayErrors: true,
  })

  const result = script.runInThisContext()
  /* require是当前环境的require所以可以引用node_modules中的代码 */
  result.call(m.exports, m.exports, require, m)
  return m
}

const mfs = new MemoryFs
const serverCompiler = webpack(serverConfig)
serverCompiler.outputFileSystem = mfs
let serverBundle
serverCompiler.watch({}, (err, status) => {
  if (err) throw err
  status = status.toJson()
  status.errors.forEach(err => console.error(err))
  status.warnings.forEach(warn => console.warn(warn))

  const bundlePath = path.join(
    serverConfig.output.path,
    serverConfig.output.filename
  )
  const bundle = mfs.readFileSync(bundlePath, 'utf-8')  // bundle为string格式需要转换格式
  const m = getModuleFromString(bundle, 'server-entry.js')  // 解析bundle内容,特别的需要指定文件名
  serverBundle = m.exports
})

module.exports = function (app) {
  app.use('/public', proxy({
    target: 'http://localhost:8888'
  }))

  app.get('*', function (req, res, next) {
    if(!serverBundle){
      return res.send('waiting for compiling,refresh later')
    }

    getTemplate().then(template => {
      return serverRender(serverBundle, template, req, res)
    }).catch(next)
  })
}

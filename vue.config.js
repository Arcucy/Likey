const path = require('path')

module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '././'
    : './',
  configureWebpack: {
    performance: {
      hints: 'warning',
      // 入口起点的最大体积
      maxEntrypointSize: 50000000,
      // 生成文件的最大体积
      maxAssetSize: 30000000,
      // 只给出 js 文件的性能提示
      assetFilter: function (assetFilename) {
        return assetFilename.endsWith('.js')
      }
    },
    module: {
      rules: [
        {
          test: /\.(svg)(\?.*)?$/,
          use: [
            {
              loader: 'svg-sprite-loader',
              options: {
                limit: 10000,
                name: 'assets/img/[name].[hash:7].[ext]',
                symbolId: 'icon-[name]'
              }
            }
          ]
        }
      ]
    }
  },
  chainWebpack: config => {
    config.module
      .rule('svg')
      .test(() => false)
      .use('file-loader')

    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    types.forEach(type => addStyleResource(config.module.rule('less').oneOf(type)))
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [
        path.resolve('./src/style/theme.less')
      ]
    },
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  },
  runtimeCompiler: true
}

function addStyleResource (rule) {
  rule.use('style-resource')
    .loader('style-resources-loader')
    .options({
      patterns: [
        path.resolve(__dirname, './src/themes/variables.less')
      ]
    })
}

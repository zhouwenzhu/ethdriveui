const { override, overrideDevServer, addDecoratorsLegacy, addLessLoader, addWebpackAlias, addPostcssPlugins, fixBabelImports } = require('customize-cra');
const path = require('path');
const webpack = require('webpack');
const paths = require('react-scripts/config/paths');
const CompressionWebpackPlugin = require('compression-webpack-plugin');

/**
 * 生产环境是否打包 Source Map 两种方法
 *
 */
// const rewiredMap = () => config => {
//   config.devtool = config.mode === 'development' ? 'cheap-module-source-map' : false
//   return config
// }

process.env.PORT = 3006
// process.env.GENERATE_SOURCEMAP !== 'false'

// path
const resolveAlias = dir => path.join(__dirname, '.', dir)

// 热跟新
// const hotLoader = () => (config, env) => {
//   config = rewireReactHotLoader(config, env)
//   return config
// }

// build--->prod --->文件设置
const appBuildPathFile = () => config => {
  // if (config.mode === 'development') {
  //   console.log('evn is development, skip build path change...')
  // } else if (config.mode === 'production') {
  //   console.log('evn is production, change build path...')
  //   // 关闭sourceMap
  //   config.devtool = false
  //   //  // 配置打包后的文件位置修改path目录
  //   paths.appBuild = path.join(path.dirname(paths.appBuild), 'dist')
  //   config.output.path = path.join(path.dirname(config.output.path), 'dist')
  //   // 添加js打包gzip配置
  //   // config.plugins.push(
  //   //   new CompressionWebpackPlugin({
  //   //     test: /\.js$|\.css$/,
  //   //     threshold: 1024
  //   //   })
  //   // )
  //   // 更改生产模式输出的文件名
  //   // config.output.filename = 'static/js/[name].js?_v=[chunkhash:8]'
  //   // config.output.chunkFilename = 'static/js/[name].chunk.js?_v=[chunkhash:8]'
  // }
  const fallback = config.resolve.fallback || {};
  config.ignoreWarnings = [/Failed to parse source map/];
  config.module.rules = [
    ...config.module.rules,
    {
      test: /\.m?js/,
      resolve: {
        fullySpecified: false
      }
    }
  ];
	Object.assign(fallback, {
		crypto:require.resolve('crypto-browserify'),
		stream: require.resolve('stream-browserify'),
		assert: require.resolve('assert'),
		http: require.resolve('stream-http'),
		https: require.resolve('https-browserify'),
		os: require.resolve('os-browserify'),
		url: require.resolve('url')
	});
	config.resolve.fallback = fallback;
	config.plugins = (config.plugins || []).concat([
		new webpack.ProvidePlugin({
			process: 'process/browser',
			Buffer: ['buffer', 'Buffer']
		})
	]);
	return config;
};

// 跨域配置
const devServerConfig = () => config => {
  return {
    ...config,
    // 服务开启gzip
    compress: true,
    proxy: {
      [process.env.REACT_APP_URL]: {
        target: 'http://183.240.196.215:35080',
        changeOrigin: true,
        pathRewrite: {
          [process.env.REACT_APP_URL]: ''
        },
        secure: false
      }
    }
  }
}

module.exports = {
  webpack: override(
    // fixBabelImports('import', {
    //   libraryName: 'antd',
    //   libraryDirectory: 'es',
    //   style: true
    // }),
    // addLessLoader({
    //   // strictMath: true,
    //   noIeCompat: true,
    //   javascriptEnabled: true,
    //   // modifyVars: { ...theme }
    //   // localIdentName: '[local]--[hash:base64:5]', // 自定义 CSS Modules 的 localIdentName
    // }),
    // addPostcssPlugins([require('postcss-pxtorem')({ rootValue: 75, propList: ['*'], minPixelValue: 2, selectorBlackList: ['am-'] })]),
    addWebpackAlias({
      '@': resolveAlias('src'),
      '@utils': resolveAlias('src/utils'),
      '@components': resolveAlias('src/components'),
			'@pages':resolveAlias('src/pages'),
    }),
    // 支持装饰器
    addDecoratorsLegacy(),

    appBuildPathFile(),
    // 关闭mapSource
    // rewiredMap(),
  // ),
  // devServer: overrideDevServer(
  //   devServerConfig()
  )
}
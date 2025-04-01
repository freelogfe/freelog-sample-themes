const path = require("path");
const { name } = require("./package");
const fs = require("fs");

function resolve(dir) {
  return path.join(__dirname, dir);
}

const port = 8105;

module.exports = {
  outputDir: "dist",
  assetsDir: "static",
  filenameHashing: true,
  devServer: {
    hot: true,
    disableHostCheck: true,
    port,
    overlay: {
      warnings: false,
      errors: true
    },
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    https: true,
    ca: fs.readFileSync("../localhost+1.pem"),
    key: fs.readFileSync("../localhost+1-key.pem"),
    cert: fs.readFileSync("../localhost+1.crt")
  },
  // 自定义webpack配置
  configureWebpack: {
    resolve: {
      alias: {
        "@": resolve("src")
      }
    },
    output: {
      jsonpFunction: `webpackJsonp_${name}`,
      globalObject: "window"
    }
  },
  chainWebpack: config => {
    // 添加新的 svg 规则
    // const svgRule = config.module.rule('svg');
    // svgRule.uses.clear();
    // svgRule
    //   .use('vue-loader-v16')
    //   .loader('vue-loader-v16') // or `vue-loader-v16` if you are using a preview support of Vue 3 in Vue CLI
    //   .end()
    //   .use('vue-svg-loader')
    //   .loader('vue-svg-loader');
  }
};

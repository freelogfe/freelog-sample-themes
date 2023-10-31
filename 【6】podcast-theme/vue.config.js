const path = require("path");
const { name } = require("./package");
const fs = require("fs");

function resolve(dir) {
  return path.join(__dirname, dir);
}

const port = 8106;

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
      errors: true,
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    // https: true,
    ca: fs.readFileSync("localhost+1.pem"),
    key: fs.readFileSync("localhost+1-key.pem"),
    cert: fs.readFileSync("localhost+1.crt"),
  },
  // 自定义webpack配置
  configureWebpack: {
    resolve: {
      alias: {
        "@": resolve("src"),
      },
    },
    output: {
      // 把子应用打包成 umd 库格式
      library: `${name}-[name]`,
      libraryTarget: "umd",
      jsonpFunction: `webpackJsonp_${name}`,
    },
  },
};

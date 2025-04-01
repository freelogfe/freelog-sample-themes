const path = require("path");
const { name } = require("./package");
const fs = require("fs");

function resolve(dir) {
  return path.join(__dirname, dir);
}

const port = 8102;

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
    https: true,
    ca: fs.readFileSync("../localhost+1.pem"),
    key: fs.readFileSync("../localhost+1-key.pem"),
    cert: fs.readFileSync("../localhost+1.crt"),
  },
  configureWebpack: {
    resolve: {
      alias: {
        "@": resolve("src"),
      },
    },
    output: {
      jsonpFunction: `webpackJsonp_${name}`,
      globalObject: "window",
    },
  },
};

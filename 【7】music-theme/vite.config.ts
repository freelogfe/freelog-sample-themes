import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import mkcert from "vite-plugin-mkcert";
import { resolve, join } from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

import { writeFileSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    mkcert(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
    // 自定义插件
    // (function () {
    //   let basePath = "";
    //   return {
    //     name: "vite:micro-app",
    //     apply: "build",
    //     configResolved(config) {
    //       // 构建完成后，配置 basePath 为打包的基础路径
    //       basePath = `${config.base}${config.build.assetsDir}/`;
    //     },
    //     writeBundle(options, bundle) {
    //       // 遍历每个构建后的文件
    //       for (const chunkName in bundle) {
    //         if (Object.prototype.hasOwnProperty.call(bundle, chunkName)) {
    //           const chunk = bundle[chunkName];
    //           if (chunk.fileName && chunk.fileName.endsWith(".js")) {
    //             // 重写相对路径为基于 basePath 的绝对路径
    //             chunk.code = chunk.code.replace(
    //               /(from|import\()(\s*['"])(\.\.?\/)/g,
    //               (all, $1, $2, $3) => {
    //                 // Use pathToFileURL for local file paths
    //                 const absolutePath = pathToFileURL(join(basePath, $3)).href;
    //                 return `${$1}${$2}${absolutePath}`;
    //               }
    //             );

    //             // 写回文件系统
    //             const fullPath = join(options.dir, chunk.fileName);
    //             writeFileSync(fullPath, chunk.code);
    //           }
    //         }
    //       }
    //     }
    //   };
    // })()
  ],
  server: {
    port: 8107,
    host: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, ".", "src")
    }
  },
  build: {
    outDir: "dist",
    assetsDir: "static",
    rollupOptions: {
      output: {
        // 入口文件输出
        entryFileNames: "static/js/[name].js",
        // 分块文件输出
        chunkFileNames: "static/js/[name]-[hash].js",
        // 资源文件输出
        assetFileNames: assetInfo => {
          // 判断是否是 CSS 文件
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "static/css/[name]-[hash][extname]"; // 输出到 static/css
          }
          // 默认输出路径
          return "static/[name]-[hash][extname]";
        }
      }
    }
  }
});

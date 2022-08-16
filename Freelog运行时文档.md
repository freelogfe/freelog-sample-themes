# 前言

Freelog 为了便于插件的开发与管控，在 Freelog 中开发的所有插件都需要运行在 Freelog 运行时上。

在 Freelog 运行时中，我们提供了一系列 api ，您可在开发中轻松调用，同时您不再需要关心登录、授权等功能的实现逻辑。

本文所指运行时皆指 Freelog 运行时。

具体的开发流程可以参考[《Freelog 主题开发引导》](TODO:真实的文档路径)。

---

# 介绍

如果将运行时比作一艘船，那插件就是搭乘这艘船的乘客，将通往 Freelog 新大陆。

## 运行时是什么？

> 运行时是一个在 [qiankun 微前端架构](https://qiankun.umijs.org/) 基础上进行二次开发的运行时环境，插件将作为子应用运行在运行时上。

## 插件是什么？

> TODO:沿用《帮助中心》文档的插件介绍，目前缺失。
> 插件是运行在运行时的应用或独立组件，它可以是一个完整的项目，也可以是一个播放器、一个编辑器、一个阅读器等等。主题是一个完整的前端项目，它是一种特殊的插件。

## 主题（Theme）是什么？

> 在 Freelog 平台，如果节点商想向资源消费者分享节点或者展品，需先为节点添加激活一个「主题」，主题决定了节点面向资源消费者呈现时的整体外观和设计。 —— [《基础概念》](https://freelog3.freelog.com/$freelog-61f252ef6fe5c1002e2c7b4b=/home_id=62d0cf48456ff0002e3294fb)

## 运行原理

> 插件打包后上传至 Freelog，运行时解压插件文件之后，通过解析 index.html 和修改 webpack_public_path 获取 js 和 css 等文件，根据 js 中要求配置的插件生命周期来启动、加载与卸载插件。

---

# 插件开发准备

## 支持框架

Vue2、Vue3、React、Angular、jQuery

## webpack 通用配置

> webpack 是运行时目前唯一支持打包工具。

后文有上述各类框架的配置示例。

### 修改运行时 [Public Path](https://webpack.js.org/guides/public-path/)

因为插件的所有文件都打包上传至 Freelog，运行时对文件的访问进行了代理，插件访问插件内部文件也将通过运行时，如 index.html 中的 js、css、js 中的图片等。配置 publicPath 为应用程序中的所有资源指定基本路径，使打包后的插件对文件的访问能指向正确的访问路径。

```js
// 在 src 目录下创建 public-path.js，将在入口文件引入

if (window.__POWERED_BY_FREELOG__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_FREELOG__;
}
```

```js
// 在入口文件（main.js）中引入

import "./public-path";
```

### webpack 配置示例

```js
// 开发模式需配置 headers 解决跨域

devServer: {
  hot: true,
  disableHostCheck: true,
  port,
  overlay: { warnings: false, errors: true },
  headers: { 'Access-Control-Allow-Origin': '*' }
},
output: {
  library: `${name}-[name]`,
  libraryTarget: 'umd', // 将子应用打包为 umd 库格式
  jsonpFunction: `webpackJsonp_${name}`, // webpack5 使用 chunkLoadingGlobal: `webpackJsonp${name}`
},
```

### 插件生命周期

需要在插件项目的入口文件导出三个生命周期，以供运行时启动、加载与卸载插件。

- bootstrap: 启动
- mount: 加载
- unmount: 卸载

## 各框架配置示例

### Vue2 配置示例

```js
// router/index.js

import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/home",
    name: "home",
    component: () => import("../views/home.vue"),
  },
];

// 导出 routes 即可，在 main.js 中 render 时再对 router 进行初始化
export default routes;
```

```js
// main.js

import "./public-path";
import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App.vue";
import routes from "./router";
import store from "./store";

Vue.config.productionTip = false;

let router = null;
let instance = null;

function render(props = {}) {
  const { container } = props;
  router = new VueRouter({
    base: "/",
    mode: "history",
    routes,
  });

  instance = new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount(container ? container.querySelector("#app") : "#app");
}

if (!window.__POWERED_BY_FREELOG__) {
  render();
}

??? storeTest 到底能不能用
function storeTest(props) {
  props.onGlobalStateChange &&
    props.onGlobalStateChange(
      (value, prev) => console.log(`[onGlobalStateChange - ${props.name}]:`, value, prev),
      true
    );
  props.setGlobalState &&
    props.setGlobalState({
      ignore: props.name,
      user: {
        name: props.name,
      },
    });
}

export async function bootstrap() {
  console.log("[vue] vue app bootstraped");
}

export async function mount(props) {
  console.log("[vue] props from main framework", props);
  storeTest(props);
  render(props);
}

export async function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = "";
  instance = null;
  router = null;
}
```

```js
// webpack 配置（vue.config.js）

const path = require("path");
const { name } = require("./package");

function resolve(dir) {
  return path.join(__dirname, dir);
}

const port = 8080;

module.exports = {
  outputDir: "dist",
  assetsDir: "static",
  filenameHashing: true,
  devServer: {
    hot: true,
    disableHostCheck: true,
    port,
    overlay: { warnings: false, errors: true },
    headers: { "Access-Control-Allow-Origin": "*" },
  },
  configureWebpack: {
    resolve: { alias: { "@": resolve("src") } },
    output: {
      library: `${name}-[name]`,
      libraryTarget: "umd", // 将子应用打包为 umd 库格式
      jsonpFunction: `webpackJsonp_${name}`, // webpack5 使用 chunkLoadingGlobal: `webpackJsonp${name}`
    },
  },
};
```

### Vue3 配置示例

```ts
// router/index.ts

import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/home",
    name: "home",
    component: () => import("../views/home.vue"),
  },
];

// 导出 routes 即可，在 main.js 中 render 时再对 router 进行初始化
export default routes;
```

```ts
// main.ts

import "./public-path";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import routes from "./router";
import store from "./store";

let router = null;
let instance = null;

function render(props = {}) {
  const { container } = props;
  router = createRouter({
    history: createWebHistory("/"),
    routes,
  });

  instance = createApp(App);
  instance.use(router);
  instance.use(store);
  instance.mount(container ? container.querySelector("#app") : "#app");
}

if (!window.__POWERED_BY_FREELOG__) {
  render();
}

export async function bootstrap() {
  console.log("%c ", "color: green;", "vue3.0 app bootstraped");
}

export async function mount(props) {
  storeTest(props);
  render(props);
  if (instance.config) {
    instance.config.globalProperties.$onGlobalStateChange = props.onGlobalStateChange;
    instance.config.globalProperties.$setGlobalState = props.setGlobalState;
  }
}

export async function unmount() {
  instance.unmount();
  instance._container.innerHTML = "";
  instance = null;
  router = null;
}

// 插件通信功能暂未测试
??? storeTest 到底能不能用
function storeTest(props) {
  props.onGlobalStateChange &&
    props.onGlobalStateChange(
      (value, prev) => console.log(`[onGlobalStateChange - ${props.name}]:`, value, prev),
      true
    );
  props.setGlobalState &&
    props.setGlobalState({
      ignore: props.name,
      user: {
        name: props.name,
      },
    });
}
```

```ts
// webpack 配置（vue.config.js）

const path = require("path");
const { name } = require("./package");

function resolve(dir) {
  return path.join(__dirname, dir);
}

const port = 8080;

module.exports = {
  outputDir: "dist",
  assetsDir: "static",
  filenameHashing: true,
  devServer: {
    hot: true,
    disableHostCheck: true,
    port,
    overlay: { warnings: false, errors: true },
    headers: { "Access-Control-Allow-Origin": "*" },
  },
  configureWebpack: {
    resolve: { alias: { "@": resolve("src") } },
    output: {
      library: `${name}-[name]`,
      libraryTarget: "umd", // 将子应用打包为 umd 库格式
      jsonpFunction: `webpackJsonp_${name}`, // webpack5 使用 chunkLoadingGlobal: `webpackJsonp${name}`
    },
  },
};
```

### React 配置示例

```tsx
// router/index.tsx

import React from "react";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import { HomeScreen } from "../screens/home/home";

const history = createBrowserHistory();

const RouterView = () => {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact render={() => <Redirect to="/home" />} />
        <Route path="/home" component={HomeScreen}></Route>
      </Switch>
    </Router>
  );
};

export default RouterView;
```

```ts
// index.js

import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./public-path";
import RouterView from "./router";

reportWebVitals();

export async function bootstrap() {
  console.log("[react17] react app bootstraped");
}

export async function mount() {
  ReactDOM.render(<RouterView />, document.getElementById("root"));
}

export async function unmount(props) {
  const { container } = props;
  ReactDOM.unmountComponentAtNode(container ? container.querySelector("#root") : document.getElementById("root"));
}

if (!window.__POWERED_BY_FREELOG__) {
  bootstrap().then(mount);
}
```

```ts
  // npm run eject 生成 webpack 的配置文件（config/webpackDevServer.config.js）

  ??? 这三项配置在小说主题没有配，但是不影响开发，是否可以去掉？
  library: `${name}-[name]`,
  libraryTarget: "umd", // 将子应用打包为 umd 库格式
  jsonpFunction: `webpackJsonp_${name}`, // webpack5 使用 chunkLoadingGlobal: `webpackJsonp${name}`

  // ...
  headers: { 'Access-Control-Allow-Origin': '*' },
  // ...

  ??? 这项配置在小说主题没有配，但是不影响开发，是否可以去掉？
  if (NODE_ENV === 'development') {
    process.env.WDS_SOCKET_HOST = 'localhost';
    process.env.WDS_SOCKET_PATH = 'localhost:'+ process.env.PORT; // webpack5设置为""
    process.env.WDS_SOCKET_PORT = process.env.PORT;
  }
```

### jQuery 配置

```ts
// entry.js

const render = ($) => {
  $("#purehtml-container").html("Hello, render with jQuery");
  return Promise.resolve();
};

((global) => {
  global["purehtml"] = {
    bootstrap: () => {
      console.log("purehtml bootstrap");
      return Promise.resolve();
    },
    mount: () => {
      console.log("purehtml mount");
      return render($);
    },
    unmount: () => {
      console.log("purehtml unmount");
      return Promise.resolve();
    },
  };
})(window);
```

## 节点

开发插件如果只在本地开发，不运行在运行时上，就无法与 Freelog 平台建立联系，因此我们需要准备一个节点，并且将节点与项目连接起来。

### 准备一个节点

[创建一个节点](https://console.freelog.com/node/creator)。创建成功之后，在推荐主题页面中，点击“我是主题/插件开发者”签约**占位主题**，如果您不小心跳过了签约主题页面，还可以到节点的主题管理页面进行签约。

> 按照规定，节点在没有主题激活的情况下无法打开，开发者需要一个主题框架，因此签约官方准备的**占位主题**即可。

注意：推荐主题会默认**开放授权**，如果退出登录状态下无法进入节点并显示“当前节点主题未开放授权，继续浏览请签约并获取授权”，导致无法继续开发登录相关功能，是因为您修改了主题展品的授权策略，该策略没有将节点所激活的主题开放授权，未开放授权的展品不会被自动签约且无法被未登录用户访问，因此需要主题启用以下策略（代码模式）：

```
for public

initial[active]:
  terminate
```

### 建立连接

将本地正在开发的插件与节点建立连接，与节点数据建立联系，通过调用运行时提供的 API 进行开发。

#### https 与 http

节点地址的协议是 https，而本地的协议是 http，这会导致运行时无法获取本地插件文件，因此我们需要先使本地项目的协议转为 https，参考方法如下：

1. 以管理员身份打开 powershell

2. 修改命令执行策略
   `Set-ExecutionPolicy -ExecutionPolicy Bypass`并设置`Y`

3. 安装 chocolatey
   `iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))`
   安装完成后可输入`choco`验证是否安装成功，如显示`Chocolatey v1.1.0`则代表安装成功（v 后面是版本号，安装版本可能不同）

4. 安装 mkcert
   `choco install mkcert`
   安装完成后可输入`mkcert`验证是否安装成功，如显示`Usage of mkcert`则代表安装成功

5. 利用 mkcert 生成证书
   `mkcert -install`
   `mkcert localhost 192.168.2.102`（将 ip 地址改为您本地的 ip 地址）

6. 到您电脑的`C:\Users\${您的电脑设备用户名}`路径下找到`localhost+1.pem`与`localhost+1-key.pem`文件，将两个文件复制到主题项目的根目录下，再复制一份`localhost+1.pem`文件到项目根目录下，并将后缀名改为`.crt`，一共三个文件

7. 在插件项目 webpack 配置文件中添加以下配置（示例）

```js
const fs = require("fs");

module.exports = {
  devServer: {
    https: true,
    ca: fs.readFileSync("192.168.2.102+1.pem"),
    key: fs.readFileSync("192.168.2.102+1-key.pem"),
    cert: fs.readFileSync("192.168.2.102+1.crt"),
  },
};
```

8. 重启主题项目

#### 连接测试节点与本地

##### 主题

在节点 url 后面拼接主题项目本地运行 url：`${节点url}?dev=${本地运行url}`。

如：节点 url 为`https://zhuc-test.freelog.com`，本地运行 url 为`https://localhost:8888`，访问`https://zhuc-test.freelog.com?dev=https://localhost:8888`将本地与节点建立连接。

##### 插件

在节点 url 后面拼接插件项目本地运行 url：`${节点url}?dev=replace&${插件id}=${本地运行url}`。

如：节点 url 为`https://zhuc-test.freelog.com`，插件 id 为 "62270c5cf670b2002e800193"，本地运行 url 为`https://localhost:8888`，访问`https://zhuc-test.freelog.com?dev=replace&62270c5cf670b2002e800193=https://localhost:8888`将本地与节点建立连接。

---

# 开发

## API

开发 API 请查阅[《Freelog 运行时 api 文档》](https://widget-docs.freelog.com/api)。

## 配置插件配置数据

??? 为什么运行时要占用给用户操作的自定义选项数据来存这些字段，目前还有 scopedCss 和 shadowDom 两个字段也是运行时添加的

```ts
  // 通过作品或展品的meta属性配置指定key作为配置数据, 目前运行时占用的key如下（皆为默认值）
  hbfOnlyToTheme: true // 历史记录整体前进后退是否只给主题权限
  historyFB: true, // 历史记录整体前进后退是否有权限
```

## 插件通信方式

- 全局通信

??? props 结构是什么样，onGlobalStateChange 和 setGlobalState 方法传参是什么样

```ts
// 在入口通过 props 修改与监听全局数据

function storeTest(props) {
  props.onGlobalStateChange &&
    props.onGlobalStateChange(
      (value, prev) => console.log(`[onGlobalStateChange - ${props.name}]:`, value, prev),
      true
    );
  props.setGlobalState &&
    props.setGlobalState({
      ignore: props.name,
      user: {
        name: props.name,
      },
    });
}

export async function mount(props) {
  console.log("[vue] props from main framework", props);
  storeTest(props);
  render(props);
}
```

- 渲染插件时配置 config

??? 细化参数，config 传什么说明清楚

```ts
// 在config中传递数据或方法提供给子插件访问，同时子插件可以通过调用方法传递数据给父插件

await window.freelogApp.mountWidget(
  sub,
  document.getElementById("freelog-single"),
  subData,
  config: {}, // 子插件配置数据，需要另外获取作品上的配置数据（待提供方法）
  seq: string, // 如果要用多个同样的子插件需要传递序号，可以考虑与其余节点插件避免相同的序号
);
```

- 插件对外发布 api

??? 可不可用，目前要是不可用不要写上来

```ts
// 后期实现通过
// freelogApp.registerApi(eventName,callBack,auth)
// eventName: '事件名称：插件唯一识别+自定义api名称'
// callBack: 当其余插件freelogApp.dispatch这个事件时，调用此函数（此函数相当于是插件对外发布的api）
// auth: 权限级别，例如是否只允许父插件调用
```

## 授权错误返回值

??? 这是什么

```ts
  **存在但未授权**
  {
    authErrorType: 1,// 存在但未授权
    authCode: resData.authCode,
    exhibitName,
    exhibitId,
    articleNid,
    resourceType,
    subDep,
    versionInfo: {exhibitProperty},
    data: resData,
  }
  **不存在**
  {
    authErrorType: 2,// 不存在
    authCode: resData.authCode,
    exhibitName,
    exhibitId,
    articleNid,
    resourceType,
    subDep,
    versionInfo: {exhibitProperty},
  }
```

## 静态文件处理

??? 目前几个主题开发过程中没有遇到这个问题，是否已经不需要再让开发者去了解这个问题

**打包之后 css 中的字体文件和图片加载 404**

原因是 freelog 将外链样式改成了内联样式，但是字体文件和背景图片的加载路径是相对路径。

而 css 文件一旦打包完成，就无法通过动态修改 publicPath 来修正其中的字体文件和背景图片的路径。

解决方案：

1. 大图片与大字体处理方式：

   大图片：放在不需要 webpack 打包的 public 目录下，通过 **window.freelogApp.getStaticPath(path)** 获取正确地址，
   其中 path 为以/开头的正常开发时的路径。

   大字体：（暂未实现）如果路径写在 css 中则无需刻意放在 public 目录下，如果使用 js 去赋值，则同图片一样处理。

2. 小文件处理方式：借助 webpack 的 url-loader 将字体文件和图片打包成 base64（适用于字体文件和图片体积小的项目）

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp|woff2?|eot|ttf|otf)$/i,
        use: [
          {
            loader: "url-loader",
            options: {},
          },
        ],
      },
    ],
  },
};
```

**vue-cli3 项目写法：**

```js
module.exports = {
  chainWebpack: (config) => {
    config.module.rule("fonts").use("url-loader").loader("url-loader").options({}).end();
    config.module.rule("images").use("url-loader").loader("url-loader").options({}).end();
  },
};
```

**5. vue-cli3 项目可以将 css 打包到 js 里面，不单独生成文件(不推荐，仅适用于 css 较少的项目)**

配置参考 [vue-cli3 官网](https://cli.vuejs.org/zh/config/#css-extract):

```js
module.exports = {
  css: {
    extract: false,
  },
};
```

---

# 上线

## 打包

打包我们的主题项目。

## 创建资源

去 Freelog 工作台[创建资源](https://console.freelog.com/resource/creator)（资源类型为插件或主题）。

## 上传

将打包好的文件压缩为 zip 压缩包并上传。

## 上线

将资源上线，该资源就会出现在[资源市场](https://console.freelog.com/market)中。

---

# 结言

如您还有其他问题，请

- 查看[《Freelog 主题开发引导》](https://widget-docs.freelog.com)；TODO
- 查看[《Freelog 运行时 api 文档》](https://widget-docs.freelog.com/api)；
- 到 [Freelog 论坛](https://forum.freelog.com/) 提出问题；
- 向 Freelog 官方邮箱service@freelog.com 或 Freelog 微信公众号 进行留言；
- 加入微信群联系客服。

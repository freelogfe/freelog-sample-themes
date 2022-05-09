# 前言

> 在阅读此文档之前，请确保您已了解 HTML、CSS 和 JavaScript，并具备一定的前端开发能力。

本文将会以**主题资源创作者**的用户角色视角，完整地描述使用当下国内最受欢迎的前端框架**Vue 2**开发一个音乐类播客主题的流程。

本文所指运行时皆指 freelog 运行时。

建议搭配[《Freelog 插件开发文档》](https://fedoc.freelog.com)与[《Freelog 插件开发接口文档》](https://fedoc.freelog.com/api/)一起阅读。

# 介绍

## 主题（Theme）是什么？

> 在 Freelog 平台，主题是指资源类型为主题的功能性资源，主题将决定节点的整体外观和设计。在节点激活主题展品即在您的节点上应用该主题。如果激活一个新的主题，只要主题支持的资源类型不变，除了布局之外，节点上的展示的内容型展品也不会发生改变。 —— 《Freelog 产品介绍》

## 我的角色？

> xxx

---

# 准备

## 创建项目

首先我们需要创建一个新的前端项目，并确保项目在本地能正常运行。

## 项目配置

> webpack 是目前 Freelog 运行时**唯一支持**的打包工具

### 在 src 目录下创建 public-path.js 文件

主题打包文件存放于 freelog 平台，运行时通过解析 index.html 和修改 webpack_public_path 来获取 js 和 css 等文件。

```js
if (window.__POWERED_BY_FREELOG__) {
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_FREELOG__;
}
```

### main.js 配置示例

```js
import "./public-path";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App.vue";
import routes from "./router";
import store from "./store";

Vue.config.productionTip = false;

Vue.use(ElementUI);

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

## 连接主题与节点

---

# 开发

> 从空项目到完成整个主题的全过程

## 登录相关

---

# 其他问题

## CDN

运行时暂不支持 CDN 方式引入 js，必须经过 webpack 约定配置后打包。

## 路由

目前运行时仅支持 history 路由或不由运行时管理的 abstract 路由。
hash 路由暂不支持。

## 移动端

### 适配

目前运行时支持得最好的是 viewport 方案，推荐使用 postcss-px-to-viewport。当然，您也可以按照您的实际情况来指定最适合项目适配方案。

### 调试

推荐使用 vconsole 来进行移动端调试。

注意：在 vconsole 基础配置完成后，还需要将原本链接中的 dev 改为 devconsole 使之生效，如
` http://podcast.freelog.com/?dev=http://localhost:8080`
改为
`http://podcast.freelog.com/?devconsole=http://localhost:8080`

## URL

当您需要获取当前 url 时，通常我们使用`window.location.href`，但是这样的方式在运行时下获取不到完整的 url，因此我们需要使用运行时提供的`window.location.currentURL`来获取。

---

# 结言

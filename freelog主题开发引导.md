# 前言

> 在阅读此文档之前，请确保您已了解 Freelog 的概念且具备一定的**前端**开发能力。

本文所指运行时皆指 Freelog 运行时。

建议搭配[《Freelog 插件开发文档》](https://fedoc.freelog.com)与[《Freelog 插件开发接口文档》](https://fedoc.freelog.com/api/)一起阅读。

---

# 介绍

## 主题（Theme）是什么？

> 在 Freelog 平台，主题是指资源类型为主题的**功能性资源**，主题将决定节点的整体外观和设计。在节点激活主题展品即在您的节点上应用该主题。如果激活一个新的主题，只要主题支持的资源类型不变，除了布局之外，节点上的展示的内容型展品也不会发生改变。 —— [《Freelog 运营帮助文档》（TODO:链接至产品运营文档）](xxx)

## 通俗解释

> 一家音像店会有哪些相关的对象？音像店、音像店老板、店铺、店铺主人、音像商品、音像创作者，我们了解他们之间的关系。

> 那 Freelog 之间的对象关系是怎样的？相对应地，音像是**资源**，音像创作者是**资源作者**，音像店是**节点**，音像店老板是**节点商**，店里拥有需多音像商品，这些商品都是**展品**，除此之外店铺也是一种**资源**，它是一种店铺主人创作的资源，但与其他资源不同的是，店铺在被音像店使用时，它虽同为展品却不为商品，而是决定书店的外观与功能，它的消费者是节点商而不是大众用户。店铺是一种功能性资源，**主题就是这种功能性资源**。

## 我的角色？

我们的主要角色是以上例子中的店铺主人，也就是**主题资源作者**，但是与其他内容性资源作者不同，我们需要确保在正常情况下主题能够使节点商正常使用，因此，在整个创作过程中我们有时也需要扮演**节点商**的角色。

本文将会完整地描述使用**Vue 2**开发一个[播客主题（TODO:链接至主题详情页）](xxx)的流程，您可以到[播客节点（TODO:名字需要替换成官方节点，链接至节点页面）](xxx)查看效果。

---

# 准备

## 创建项目

创建一个 Vue2 项目 podcast-theme。

`vue create podcast-theme` 或 `vue init webpack podcast-theme`。

## 项目配置

> 使用不同前端框架，配置也会有所不同，如果您使用其他前端框架，具体配置方法请查看[《Freelog 插件开发文档》](https://fedoc.freelog.com/#%E6%A1%86%E6%9E%B6%E5%87%86%E5%A4%87)。

### webpack 配置示例

webpack 是目前 Freelog 运行时**唯一支持**的打包工具。

在 `vue.config.js` 中配置

```js
const path = require("path");
const { name } = require("./package");

function resolve(dir) {
  return path.join(__dirname, dir);
}

const port = 8888; // 本地端口号

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
```

### 在 src 目录下创建 public-path.js 文件

主题打包文件存放于 Freelog 平台，运行时通过解析 `index.html` 和修改 `webpack_public_path` 来获取 js 和 css 等文件。

```js
if (window.__POWERED_BY_FREELOG__) {
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_FREELOG__;
}
```

### router 配置示例

该文件导出 `routes` 即可，在 `main.js` 中 render 时再对 `router` 进行初始化。

```js
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

export default routes;
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

## 节点

开发主题如果只在本地开发，则无法与 Freelog 平台建立联系，音像店就无法拥有商品与店铺。

### 准备一个节点

[创建一个节点](https://console.freelog.com/node/creator)，建立我们的音像店。

### 添加主题

按照规定，节点在没有主题激活的情况下无法打开，因此需要去[资源市场](https://console.freelog.com/market)中任意签约一个主题，使节点能够正常打开。

注意：如果退出登录状态下无法进入节点并显示“当前节点主题未开放授权，继续浏览请签约并获取授权”，导致无法继续开发登录相关功能，是因为您没有将节点所激活的主题**开放授权**，未开放授权的展品不会被自动签约且无法被未登录用户访问，因此需要主题启用以下策略（代码模式）：

```
for public

initial[active]:
  terminate
```

TODO:我不知道如何合理地解释这一块设定，一定要去签约一个毫不相关的主题且开放授权，才能正常开发新的主题，不然节点根本打不开，这对开发者来说实在太奇怪了。

### 建立连接

将本地正在开发的主题与节点建立连接，与节点数据建立联系，通过调用运行时提供的 API 进行开发。

#### https 与 http

节点地址的协议是 https，而本地的协议是 http，这会导致运行时无法获取本地主题文件，因此我们需要先使本地项目的协议转为 https，参考方法如下：

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

6. 到您电脑的`C:\Users\您的电脑设备用户名`路径下找到`localhost+1.pem`与`localhost+1-key.pem`文件，将两个文件复制到主题项目的根目录下，再复制一份`localhost+1.pem`文件到项目根目录下，并将后缀名改为`.crt`，一共三个文件

7. 在主题项目`vue.config.js`文件中添加配置（示例）

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

在节点 url 后面拼接主题项目本地运行 url：`${节点url}?dev=${本地运行url}`。

如：节点 url 为`https://zhuc-test.freelog.com`，本地运行 url 为`https://localhost:8888`，访问`https://zhuc-test.freelog.com?dev=https://localhost:8888`将本地与节点建立连接。

---

# 开发

> 运行时提供了一系列 API 挂载到 window.freelogApp 上，整个主题的数据交互都会通过 API 实现，开发者不需要关心跨域问题，也不建议请求外部接口。

## 登录相关

调用运行时 api 即可，无需自己开发 ui 与相关逻辑。

- 登录：[callLogin（TODO:链接至 API 开发文档对应的 API 位置）](xxx)，登录成功后默认刷新页面。

```js
// 调起运行时登录弹窗
window.freelogApp.callLogin();
```

- 自定义登录成功后的操作：在入口文件`main.js`中将回调函数传给[onLogin（TODO:链接至 API 开发文档对应的 API 位置）](xxx)方法。

```js
// main.js

// 如果依然需要刷新页面，需要手动设定
window.freelogApp.onLogin(() => {
  console.log("自定义");
  window.location.reload();
});
```

- 登出：[callLoginOut（TODO:链接至 API 开发文档对应的 API 位置）](xxx)，登出成功会自动刷新页面。

```js
// 调起运行时登出弹窗
window.freelogApp.callLoginOut();
```

- 获取当前登录的用户数据：[getCurrentUser（TODO:链接至 API 开发文档对应的 API 位置）](xxx)。

```js
const userData = await window.freelogApp.getCurrentUser();
```

## 引流入口

在播客主题页面的右侧中间位置，我们放了一个通往主题详情页的引流入口，但此时我们的主题还处于开发中，并没有上线到资源市场。我们预先去[创建一个资源](https://console.freelog.com/resource/creator)，这个资源将作为当前正开发的播客主题资源，创建成功后这个资源会出现在我们的[资源管理](https://console.freelog.com/resource/list)中，点击即可进入该资源的详情页，复制此页的网址作为按钮的跳转页面。

```js
TODO: 之后将链接替换为播客主题的链接;
window.open("https://console.freelog.com/resource/details/61f251286fe5c1002e2c7b41");
```

## 自定义配置

我们在首页上方特地留了一块区域，用于节点商自由配置显示的内容，包括节点 LOGO 图、节点名称、简介等，即使多个节点使用了我们的主题，也能使各个节点有不同的特色。节点商可以在展品侧，通过修改**自定义选项**自由配置。

### 自定义选项

自定义选项是资源在节点作为展品最终呈现时的所需的辅助信息，因为无法通过系统解析生成，需要资源作者或者节点商手动添加。

### 预设自定义选项

上传资源时，您可以为您的资源预设一些自定义选项，建议您同时为其设置默认值，确保相应功能不会因为没有进行配置而发生问题。

如：我们预设了一个自定义选项“节点标题”，key 为`nodeTitle`，类型是输入框，默认值设置为“播客节点”。接下来，节点商在展品侧可以对其自由配置，如无修改，则默认为“播客节点”。

### 获取主题配置

[getSelfConfig（TODO:链接至 API 开发文档对应的 API 位置）](xxx)

```js
// 主题配置
const selfConfig = await window.freelogApp.getSelfConfig();
// 节点标题
const { nodeTitle } = selfConfig;
this.title = nodeTitle;
```

### 开发中实现自定义配置

当前激活的是其他主题，我们暂时可以跳过预设这一步进行开发，先手动添加自定义选项。

> 主题开发完成上传资源时，建议预设所有可配置的选项，否则节点商无法知道如何配置。

在所激活主题的展品侧的高级设置中手动添加以下自定义选项：

```js
// 用数组的形式描述示例，实际交互并非如此
[
  { key: "nodeTitle", 属性说明: "节点标题", 自定义选项: "音乐播客" },
  { key: "nodeAvatar", 属性说明: "节点LOGO", 自定义选项: "https://xx.jpg" },
  // ...
];
```

```js
// 项目中获取配置并使用
const selfConfig = await window.freelogApp.getSelfConfig();
const { nodeTitle, nodeAvatar } = selfConfig;
this.title = nodeTitle;
this.logo = nodeAvatar;
```

### 内容性资源的自定义选项

除了主题可以通过自定义选项配置以外，内容性资源同样可以。

播客主题中，每一个展品都有简介，节点商可以在展品侧配置自定义选项`intro`修改展品的简介。接下来可以通过展品版本信息（`versionInfo`）中的展品属性（`exhibitProperty`）里获取到展品简介。

## 展品相关

### 添加展品

签约内容性资源到节点作为展品，这样我们的音像店里就有了音像商品。

可以通过以下方式添加展品：

- 签约[资源市场](https://console.freelog.com/market)里的资源。
- 自己[创建资源](https://console.freelog.com/resource/creator)，并将其添加为展品。注意：请勿上传可能引起版权纠纷的资源，以免造成不必要的麻烦。

### 展品列表

以声音列表为例，我们需要分页获取展品，调用[getExhibitListByPaging（TODO:链接至 API 开发文档对应的 API 位置）](xxx)。

```js
const queryParams = {
  limit: 20, // 分页：每页展品数
  skip: 0, // 检索起始索引
  articleResourceTypes: "audio", // 检索类型为 audio 的展品
  isLoadVersionProperty: 1, // 同时查询展品的版本信息（自定义选项配置数据也会在此返回）
};
const list = await window.freelogApp.getExhibitListByPaging(queryParams);
const { dataList, totalItem } = list.data.data;
// 展品列表数据
this.listData = dataList;
// 展品总数
this.total = totalItem;
```

### 展品签约量

每个声音的签约量都需要在声音卡片下方显示出来，通过[getExhibitSignCount（TODO:链接至 API 开发文档对应的 API 位置）](xxx)可以批量查询对应展品的签约量。

```js
// dataList 是展品列表
const ids = dataList.map((item) => item.exhibitId).join();
// 批量返回签约量
const res = await window.freelogApp.getExhibitSignCount(ids);
```

### 展品授权状态

在用户播放声音之前，需要对声音展品进行授权。

我们会在展品列表中显示未授权标识，通过[getExhibitAuthStatus（TODO:链接至 API 开发文档对应的 API 位置）](xxx)可以批量查询对应展品的授权状态，在播放时，根据授权状态决定是否播放。

也许有顾客提前与音像店签订了一份商品订单，但音像店却因为供应链出现了问题，导致无法兑现顾客的订单，顾客无法正常获得商品，需要音像店老板处理此事。同样地，即使在用户授权了展品之后，也可能因为节点与资源之间的授权链出现了问题，导致用户无法正常获得该展品的内容。因此，除了判断授权状态以外，我们还需要进一步判断其授权链是否异常，如有异常我们会在列表显示异常标识，并在播放时给出提示。

```js
// dataList 是展品列表
const ids = dataList.map((item) => item.exhibitId).join();
// 批量返回授权状态（不以参数顺序返回）
const res = await window.freelogApp.getExhibitAuthStatus(ids);
```

通过**授权不通过责任方 defaulterIdentityType**字段可以即可判断授权状态：

- 0 - 授权通过
- 1 - 资源出错
- 2 - 节点出错
- 3 - 资源出错、节点出错
- 4 - 用户未授权
- 5 - 用户未授权、资源出错
- 6 - 用户未授权、节点出错
- 7 - 用户未授权、资源出错、节点出错

我们可以简单总结出：当`defaulterIdentityType`为 0 时，授权通过；当`defaulterIdentityType`>=4 时，用户未授权，否则代表用户已授权；当`defaulterIdentityType`不为 0 且不为 4 时，代表授权链存在异常。

### 展品详情

详情页的数据需要通过[getExhibitInfo（TODO:链接至 API 开发文档对应的 API 位置）](xxx)获取。

```js
// 展品 id
const id = this.$route.query.id;
const res = await window.freelogApp.getExhibitInfo(id);
this.exhibitInfo = res.data.data;
```

### 授权

未授权的声音无法播放，可以在播放时通过[addAuth（TODO:链接至 API 开发文档对应的 API 位置）](xxx)调起授权弹窗进行授权。

```js
// 展品 id
const exhibitId = this.data;
// immediate: true 立即调起授权弹窗
const res = await window.freelogApp.addAuth(exhibitId, { immediate: true });
// 授权成功将 defaulterIdentityType 更新为 0（授权链异常时无法进行授权，如果授权成功，则代表授权链无异常，可以直接使授权通过）
if (res.status === 0) this.data.defaulterIdentityType = 0;
```

### 内容

播放已授权声音时，通过[getExhibitFileStream（TODO:链接至 API 开发文档对应的 API 位置）](xxx)获取音频文件的 url。

```js
// 展品 id
const exhibitId = this.data;
// 第二个参数如果为 false，获取文件流，如果是媒体文件，第二个参数传 true 以获得文件的 url，此 url 可以直接绑定到媒体标签的 src 使用。
const url = await window.freelogApp.getExhibitFileStream(exhibitId, true);
this.data.url = url;
```

### 签约记录

类似于购物网站的订单列表，播客主题也需要一份用户的签约记录，通过[getSignStatistics（TODO:链接至 API 开发文档对应的 API 位置）](xxx)获得这份数据。接下来，通过获取到的记录列表并调用[getExhibitListById（TODO:链接至 API 开发文档对应的 API 位置）](xxx)批量获取展品数据。注意：`getExhibitListById` 不会以参数顺序返回数据，因此需要自行处理排序。

> 因为主题也是展品，所以签约记录里包括主题展品，签约列表需要将主题筛选出去。

```js
const result = [];
const signedList = await window.freelogApp.getSignStatistics();
if (!signedList.data.data.length) {
  this.signedList = [];
  return;
}

const idList = signedList.data.data.map((item) => item.subjectId);
const ids = idList.join();
const list = await window.freelogApp.getExhibitListById({ exhibitIds: ids, isLoadVersionProperty: 1 });
// 整理排序
idList.forEach((id) => {
  const signedItem = list.data.data.find((item) => item.exhibitId === id);
  // 留下非主题的展品
  if (signedItem && signedItem.articleInfo.resourceType !== "theme") result.push(signedItem);
});
// 签约数据列表
this.signedList = result;
```

## 用户数据

播客主题中的播放列表、收藏等等此类与用户紧密相关的数据，存于用户数据里，以便在不同设备能获取到与用户相对应的数据。

以收藏功能为例：

- 在用户收藏或取消收藏时，调用[setUserData（TODO:链接至 API 开发文档对应的 API 位置）](xxx)修改用户的收藏 id 列表。

```js
// 处理后收藏的 id 列表
const collectionIdList = [...idList];
// 注意：如果值为对象或数组，需全局替换
const res = await window.freelogApp.setUserData("collectionIdList", collectionIdList);
if (res.data.msg === "success") {
  console.log("操作成功");
} else {
  console.log("操作失败");
}
```

- 通过[getUserData（TODO:链接至 API 开发文档对应的 API 位置）](xxx)获取用户收藏 id 列表。接下来，通过获取到的收藏 id 列表并调用[getExhibitListById（TODO:链接至 API 开发文档对应的 API 位置）](xxx)批量获取展品数据。注意：`getExhibitListById` 不会以参数顺序返回数据，因此需要自行处理排序。

```js
const result = [];
// 收藏的 id 列表
const collectionIdList = await window.freelogApp.getUserData("collectionIdList");
if (!collectionIdList.length) {
  this.collectionList = [];
  return;
}

const ids = collectionIdList.join();
const list = await window.freelogApp.getExhibitListById({ exhibitIds: ids, isLoadVersionProperty: 1 });
// 整理排序
store.state.collectionIdList.forEach((id) => {
  const collectionItem = list.data.data.find((item) => item.exhibitId === id);
  if (collectionItem) result.push(collectionItem);
});
// 收藏数据列表
this.collectionList = result;
```

---

# 上线

## 打包

打包我们的主题项目。

`yarn build` 或 `npm run build`。

## 创建资源

在 freelog 平台[创建一个主题资源](https://console.freelog.com/resource/creator)（资源类型为 theme），如果您之前已经提前创建，跳过此步骤。

## 上传

将打包好的文件压缩为 zip 压缩包并上传。

## 上线

将资源上线，该资源就会出现在[资源市场](https://console.freelog.com/market)中。

---

# 其他问题

## CDN

运行时暂不支持 CDN 方式引入 js，必须经过 webpack 约定配置后打包。

## 路由

目前运行时仅支持 history 路由或不由运行时管理的 abstract 路由。
hash 路由暂不支持。

## 移动端

### 适配

目前运行时支持得最好的是 viewport 方案，推荐使用 postcss-px-to-viewport。当然，您也可以按照实际情况来指定最适合项目适配方案。

### 调试

推荐使用 vconsole 来进行移动端调试。

注意：在 vconsole 基础配置完成后，连接节点时需要将原本链接中的 `dev` 改为 `devconsole` 使之生效。
如：
`http://zhuc-test.freelog.com/?dev=http://localhost:8888`
改为
`http://zhuc-test.freelog.com/?devconsole=http://localhost:8888`

## URL

当您需要获取当前 url 时，通常我们使用`window.location.href`，此方式在运行时环境下获取不到完整的 url，我们需要使用运行时提供的`window.location.currentURL`来获取。

```js
const url = window.location.href;
// /home

const url = window.location.currentURL;
// https://zhuc-test.freelog.com/?dev=https://localhost:8888/$_$freelog-629dce2d8e71fb00394bbc96=/home
```

---

# 结言

如您还有其他问题，请

- 查看[《Freelog 插件开发文档》](https://fedoc.freelog.com)；
- 查看[《Freelog 插件开发接口文档》](https://fedoc.freelog.com/api/)；
- 到[Freelog 社区（TODO:链接至社区）](xxx)提出问题；
- 向 Freelog 官方邮箱 或 Freelog 微信公众号 进行留言；
- 加入微信群联系客服。

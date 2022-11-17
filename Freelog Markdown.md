# 前言

在目前的 Freelog 中，既有主题、插件这类的功能性资源，又有阅读、音频等非功能性资源，Markdown 资源就属于「阅读」类型的资源。

---

# Freelog Markdown

在您之前 Markdown 的使用过程中，是否曾经因为 Markdown 原有的支持不够，一次次放弃掉那些原本可以锦上添花的资源，导致自己的创作成果大打折扣无法令自己满意？那如果 Markdown 可以：

- 支持插入视频、音频；
- 支持直接插入 Freelog 平台中的资源。

————这就是 Freelog Markdown。

# 语法

Freelog Markdown 的语法足够简单，几乎没有学习成本。

## 基础语法

既然叫做 Freelog Markdown，我们依然兼容并支持所有原有的 Markdown 语法。

## 插入视频、音频

Markdown 是一种文本语言，我们需要将其先转换为 HTML 代码块，才可在页面中显示出预期的效果————如果我们一开始就写 HTML 代码呢？

- 图片语法（HTML 写法）
  `<img src="http://xxxxxx" />`

- 视频语法
  `<video controls src="http://xxxxxx" />`

- 音频语法
  `<audio controls src="http://xxxxxx" />`

是的，我们直接写它最终想要的就好，只需要将语法中的`http://xxxxxx`替换为资源链接即可，并且上述写法在其他平台也同样适用。
除此之外，相信了解过 HTML 语法的朋友，应该知道在语法中也可以任意设置标签属性，例如想要插入的视频自动播放：
`<video controls autoplay src="http://xxxxxx" />`

## 插入 Freelog 平台中的资源（依赖）

刚才我们已经展示过如何在 Markdown 中通过外部链接插入媒体资源，如果您想要插入 Freelog 中的资源呢？

> `freelog://xxx`

您只需要将外部链接部分替换为`freelog://xxx`即可，其中`xxx`是资源完整名称（用户名/资源名），例如我们想要插入的资源完整名称为`abc123/test`，语法如下：

- 图片语法
  `![](freelog://abc123/test)`
  `<img src="freelog://abc123/test" />`

- 视频语法
  `<video controls src="freelog://abc123/test" />`

- 音频语法
  `<audio controls src="freelog://abc123/test" />`

- 文档语法（插入 Freelog 平台中的文档资源）
  `{{freelog://xxx}}`

> 注意：
> 如果您是 Markdown 资源创作者，别忘了在创建资源版本时处理您依赖的资源授权；
> 如果您是插件/主题开发者，如果需要支持 Markdown，那也别忘了处理依赖文件内容。

## 插件/主题开发者处理 Markdown 展品中的依赖内容

> 如果您不是插件/主题开发者，可以略过这部分内容。

- 首先获取资源的依赖树

调用[getExhibitListByPaging](https://widget-docs.freelog.com/api/#getexhibitlistbypaging)或[getExhibitInfo](https://widget-docs.freelog.com/api/#getexhibitinfo)接口获取展品信息时，将请求参数`isLoadVersionProperty`设置为 1。

```js
const res = await window.freelogApp.getExhibitInfo(exhibitId, { isLoadVersionProperty: 1 });
// 依赖树
const { dependencyTree } = res.data.data.versionInfo;
```

- 通过依赖树请求依赖文件内容

```js
// 依赖树第一项为本展品资源，处理子依赖时需过滤
const deps = dependencyTree.filter((item, index) => index !== 0);
let promiseArr = [];
deps.forEach((dep) => {
  // 根据 resourceType 判断资源是否为媒体资源
  const isMediaResource =
    dep.resourceType.includes("图片") || dep.resourceType.includes("视频") || dep.resourceType.includes("音频");
  // 调用接口获取资源内容
  const depContent = window.freelogApp.getExhibitDepFileStream(
    props.data.exhibitId,
    dep.parentNid,
    dep.articleId,
    isMediaResource
  );
  promiseArr.push(depContent);
});
// 依赖资源内容队列
const depContentList = await Promise.all(promiseArr);
```

- 全局查找依赖语法并替换为内容文本

```js
depContentList.forEach((dep, index) => {
  if (dep.data) {
    /** 非媒体资源，文本内容会以 dep.data 返回 */

    // 例子使用 showdown.js 实现 markdown 转换 HTML
    const converter = new showdown.Converter();
    const data = converter.makeHtml(dep.data);
    // 全局替换依赖语法为依赖内容
    const reg = new RegExp(`{{freelog://${deps[index].articleName}}}`, "g");
    html = html.replace(reg, data);
  } else {
    /** 非媒体资源，资源链接会以 dep 返回 */

    // 全局替换依赖语法为资源链接
    const reg = new RegExp("src=['\"]" + `freelog://${deps[index].articleName}` + "['\"]", "g");
    html = html.replace(reg, `src="${dep}"`);
  }
});
```

---

# 结言

在资源版本创建页面，Freelog 提供了一个 Freelog Markdown 编辑器，您可以在此以所见即所得的方式编辑您的 Freelog Markdown 资源，快速便捷地插入资源，以及处理授权。

```

```

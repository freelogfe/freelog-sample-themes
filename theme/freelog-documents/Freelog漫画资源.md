# 前言

为了确保支持漫画资源在线阅读的插件可以快速甄别漫画资源，同时更加便捷有效地在节点渲染漫画内容，我们申请了全新的 MIME 类型 **application/vnd.freelog.comic** 作为漫画资源在 Freelog 数字资源授权系统的专有格式。

---

# 原常见漫画格式

### 漫画文件格式

常见的漫画包格式实则为通用压缩格式对应改名而来：

- CBZ: ZIP
- CBR: RAR
- CBT: TAR
- CB7: 7Z
- CBA: ACE

### 漫画包内容

漫画压缩包内含多张图片文件，除此外通常还会有一个 xml 文件，此文件为漫画配置文件，使专用的漫画阅读器在解析漫画时以此配置渲染漫画内容。

xml 示例如下：

```xml
<?xml version="1.0"?>
<ComicInfo xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <Title>THIS IS TITLE FROM XML</Title>
  <Summary>THIS IS SUMMARY FROM XML</Summary>
  <Pages>
    <Page Image="0" ImageSize="89139" ImageWidth="720" ImageHeight="1080" Type="FrontCover" />
    <Page Image="1" ImageSize="105811" ImageWidth="720" ImageHeight="1080" />
  </Pages>
</ComicInfo>
```

### 为什么不沿用已有的漫画包格式？

1.  已有的几种漫画包格式较常用的场景为线下阅读，需要下载对应的桌面端漫画阅读器软件或移动端漫画阅读应用；
2.  xml 格式的配置文件对于非开发人员来说，不易读写；
3.  在漫画阅读相关网页（具有漫画阅读功能的主题或插件），需要针对解析漫画压缩包进行繁杂的功能开发，使渲染漫画内容变得繁琐困难。

---

# Freelog 漫画发行工具

Freelog 为了统一漫画资源输出的文件格式，我们为漫画资源作者提供了专业的漫画发行工具。

### 功能

- 上传图片：添加漫画页面图片，支持调整页面排序
- 导入本地漫画包：兼容部分常用的漫画电子书格式（CBZ、CBR、CBT）以及上述格式对应的压缩包格式（ZIP、RAR、TAR）
- 切图：条漫类型漫画，可将长图切为多张等高的小图，以提高漫画渲染效率
- 预览：模拟当前漫画在常见阅读模式下的展示效果

### 资源输出

我们将漫画类型的资源统一输出 MIME 类型为 **application/vnd.freelog.comic** 的资源文件，其中包含一系列规范命名的图片文件和一个 json 文件，基于一定的条件有时也会生成一个 xml 文件。

##### 图片文件

命名规则为：{页数}\_{切图序号}，如：

- 单张图片命名示例：001.jpg
- 切图后的单张图片命名示例：001_01.jpg

##### json 文件

文件名为 index.json，包含图片集信息与配置信息等，结构如下：

```json
{
  // 漫画类型 1-条漫 2-页漫 3-日漫
  "mode": 1,
  // 漫画图片有序队列
  "list": [
    {
      // 图片名称
      "name": "001.jpg",
      // 图片大小（B）
      "size": 199430,
      // 图片宽度
      "width": 625,
      // 图片高度
      "height": 960
    }
    // ...
  ],
  // 漫画配置（解析原漫画文件 xml 中的配置，数据信息对应上述的 xml 示例）
  "config": {
    "xml": { "attrs": { "version": "1.0" } },
    "children": [
      {
        "key": "ComicInfo",
        "value": null,
        "attrs": {
          "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
          "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance"
        },
        "children": [
          { "key": "Title", "value": "THIS IS TITLE FROM XML", "attrs": {}, "children": [] },
          { "key": "Summary", "value": "THIS IS SUMMARY FROM XML", "attrs": {}, "children": [] },
          {
            "key": "Pages",
            "value": null,
            "attrs": {},
            "children": [
              {
                "key": "Page",
                "value": null,
                "attrs": {
                  "Image": "0",
                  "ImageSize": "89139",
                  "ImageWidth": "720",
                  "ImageHeight": "1080",
                  "Type": "FrontCover"
                },
                "children": []
              },
              {
                "key": "Page",
                "value": null,
                "attrs": { "Image": "1", "ImageSize": "105811", "ImageWidth": "720", "ImageHeight": "1080" },
                "children": []
              }
            ]
          }
        ]
      }
    ]
  },
  // 用户自定义数据（可帮助用户携带其它数据）
  "custom": {}
}
```

##### xml 文件

文件名为 ComicInfo.xml，此文件只在【编辑器导入外部漫画包时有 xml 配置文件且有配置信息】前提下，保存时才会生成，该文件格式与原有的漫画格式一致。

---

# application/vnd.freelog.comic

阅读至此，相信你已对新的格式有所了解，但你可能还是疑惑————为什么使用新的漫画文件格式？

1.  比起本地图片阅读和专用的漫画阅读器的阅读方式，如今更多的人选择在线阅读漫画；
2.  json 格式的配置比起 xml 格式的配置，对非开发人员更加友好易读；
3.  web 获取漫画内容时，再也不需要考虑解析压缩包、读取图片文件与配置文件等繁杂的事情。

我们依然兼容旧格式的阅读方式：

- 本地解压阅读
  将漫画包解压之后通过图片阅读，更好的是，现在通过图片名称就可以得到图片的顺序，无需再对照配置文件。

- 漫画阅读器阅读
  将漫画包导入漫画阅读器即可阅读漫画，当漫画存在配置信息时，我们依然会有一个 xml 文件供其解析。

最重要的是，我们支持漫画资源文件的在线阅读，下面以节点侧的漫画阅读插件开发为例进行说明。

### 节点侧的漫画阅读支持

在此之前 web 想要获取漫画内容，开发者需要想发设法解压漫画压缩包（目前可用的解压库并不友好，尤其对于不常用的压缩格式），接下来读取图片文件与配置文件以渲染图片与解析配置信息，这需要不少的代码处理与时间成本。而现在我们可以采用更简单的方式实现————像图片一样通过 url 渲染。

1.  我们不再关心漫画包，只需要获得漫画资源文件里的 json 即可，可通过 getExhibitFileStream 获取 json 文件。

```js
const res = await window.freelogApp.getExhibitFileStream(exhibitId, { subFilePath: "index.json" });
const json = res.data;
const { mode, list, config, custom } = json;
```

1.  通过 list 获取图片。

list 是图片有序集，每一项是一张（页）漫画，结构如下：

```js
{
  // 图片名称
  "name": "001.jpg",
  // 图片大小（B）
  "size": 199430,
  // 图片宽度
  "width": 625,
  // 图片高度
  "height": 960
}
```

之所以 list 里不直接记录图片 url，是因为 Freelog 授权机制的存在，我们不能简单地暴露展品内容 url，但我们可以通过图片名称来获取对应的图片 url 地址。

```js
const requestList = [];
list.forEach((item) => {
  const request = window.freelogApp.getExhibitFileStream(exhibitId, { subFilePath: item.name, returnUrl: true });
  requestList.push(request);
});
const results = await Promise.all(requestList);
list.forEach((item, index) => {
  item.url = results[index];
});
```

至此，你已经获取到每一页漫画的 url 地址，可以渲染到你的页面上了。

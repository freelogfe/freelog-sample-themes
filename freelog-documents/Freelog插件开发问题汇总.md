# 插件开发问题汇总

## chrome 浏览器无法访问 localhost

地址栏输入：chrome://flags/#block-insecure-private-network-requests。

将 Block insecure private network requests 项设置为 disabled 即可。

## CDN

运行时暂不支持 CDN 方式引入 js，必须经过 webpack 约定配置后打包。

## 路由

目前运行时仅支持 history 路由或不由运行时管理的 abstract 路由。
**hash 路由暂不支持。**

## 移动端适配

目前运行时支持得最好的是 viewport 方案，推荐使用 postcss-px-to-viewport。当然，您也可以按照实际情况来指定最适合项目适配方案。

## 移动端调试

运行时已经集成了 vConsole 提供移动端调试，只需将链接中的 `dev` 改为 `devconsole` 即可生效。

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

## ios 访问白屏

??? 什么场景出现，是否可以把这个问题描述清楚一些

Invalid regular expression: invalid group specifier name

解决方法可参考：https://blog.csdn.net/RELY_ON_YOURSELF/article/details/102826159

## react 热更白屏

??? 是否可以去掉

```css
/* 将根节点同级的 iframe 隐藏 */
<style>
    #root~iframe{
      display: none !important;
    }
</style>
```

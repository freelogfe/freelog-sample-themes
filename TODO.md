## 待办

- 路由映射
  export async function bootstrap() {
    freelogApp.mapShareUrl({
      [freelogApp.SHARE_DETAIL]: (exhibitId: string) => `/vue3/${exhibitId}/detail`,
      [freelogApp.SHARE_CONTENT]: (exhibitId: string) => `/vue3/${exhibitId}/content`,
    });
  }
  获取分享链接
  freelogApp.getShareUrl(exhibitId, freelogApp.SHARE_DETAIL）

## 运行时问题

- 主题加载页面有三个 loading 图标，两个不动的圆形图标和一个动的竖线图标

- 开发的 url 例如 https://freelogcomic.testfreelog.com/?dev=https://localhost:5111&611372050938740039ad6df2=%2Fhome 为什么运行时又把主题的作品 id “&611372050938740039ad6df2” 放上来了

## 文档修改建议

- 示例代码部分：

  - 使用案例代码链接放在第一位，后面再放示例节点主题项目代码链接，再加上示例插件项目代码链接

  - 插件改造文档链接应该 https://wujie-micro.github.io/doc/guide/plugin.html，我认为这个并不需要写进我们的文档，此插件非我们的插件，同一个名词出现在同一个文档中，极可能使阅读者混淆

- 开发部分：

  - 创建节点后是否可以不强制用户签一个主题，打开节点运行时给一个无主题提示即可，借用文档中的一句话形容 “先有鸡才有蛋”，目前流程对开发者来说 不合理

  - 测试节点不能用就暂时不要写上来

  - 获取节点信息中的注释 “如果使用到了节点信息，插件开发者应当在使用说明里明确使用到了节点信息以及无法获取到的影响” 没看明白什么意思

- 其余建议：

- 建议起码参考无界官方文档的结构写一份清晰易懂的运行时文档

- 指南文档中仅需告知 api 如何调用，即告诉调用方法即可，具体 api 详细应写进 api 文档中，无需在两边写两份

- 指南文档中应该对 freelog 定制化问题给出【详细】解决方案，如分享、自定义选项、用户数据、打包发布插件等。对 freelog 无关的第三方库或实现方案不需要给出示例，如现在文档中的移动端适配方案。

除《对接新版本运行时问题》中的问题需要等运行时处理以外，还有以下问题需要处理:

- 运行时样式污染了主题样式，如滚动条、动画等等的大量类，具体 F12 到样式最底部的滚动条样式部分，点对应文件进入查看。

- 当前节点（运行时）呼出授权，会出现“该展品授权链异常，请谨慎签约”的提示并无法进行签约，运行时需修改，或直接换成子应用。

- 运行时没有正确加载静态图片，如所有主题左上角的 Logo 图片（应该是运行时的资源路径自动补全问题），并且所有静态图片资源全转成 base64 了，似乎不太合理，需要讨论。

- 分享功能：

  1. 目前运行时通过分享链接进入节点，没有正确重定向到对应路由。
  2. 目前运行时分享只支持 params 路参，不支持 query 路参，目前所有项目都是 query 路参，需要跟运行时商讨 query 路参的支持时间，来决定所有项目是否需要改为 params 路参来对接运行时。

- 之前的遗留的老问题需要确认新版运行时是否已解决：
  - 运行时暂不支持 CDN 引入 js。
  - 运行时仅支持 history 路由或不由运行时管理的 abstract 路由，hash 路由不支持。
  - 移动端 vconsole 调试。
  - 

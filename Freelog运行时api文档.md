# freelog API

以下所有接口都已挂载到 `window.freelogApp`，开发者可直接调用。

---

## 特殊数据类型

以下类型都是为了便于理解而设定的特殊类型或业务类型，会在本文出现。

### IntBoolean

**是否**

| 可选值 | 说明 |
| :----- | :--- |
| 0      | 否   |
| 1      | 是   |

### Dep

**子依赖**

| 字段         | 类型   | 说明                                                               |
| :----------- | :----- | :----------------------------------------------------------------- |
| id           | string | 作品 id                                                            |
| nid          | string | 依赖树上的节点 id                                                  |
| name         | string | 作品名称                                                           |
| type         | string | 作品类型（1：独立资源，2：组合组员，3：节点组合资源，4：存储对象） |
| resourceType | string | 资源类型                                                           |

### ExhibitVersionProperty

**展品版本属性**

| 字段         | 类型   | 说明                                      |
| :----------- | :----- | :---------------------------------------- |
| enWordCount  | number | 英文单词数（资源为文本文件时返回）        |
| zhWordCount  | number | 中文字数（资源为文本文件时返回）          |
| fileSize     | number | 文件大小                                  |
| fileSizeUnit | string | 文件大小单位                              |
| mime         | string | MIME                                      |
| ...          | ...    | ...（资源文件类型不同，会有不同字段返回） |

### ExhibitDependency

**展品依赖**

| 字段         | 类型   | 说明                                                               |
| :----------- | :----- | :----------------------------------------------------------------- |
| nid          | string | 在依赖树上的节点 id（用来确定依赖的唯一性）                        |
| articleId    | string | 作品 id                                                            |
| articleName  | string | 作品名称                                                           |
| articleType  | string | 作品类型（1：独立作品，2：组合作品，3：节点组合作品，4：存储对象） |
| version      | string | 作品版本号                                                         |
| versionRange | string | semver 版本范围                                                    |
| resourceType | string | 作品类型                                                           |
| versionId    | string | 依赖的作品版本 id                                                  |
| deep         | string | 在依赖树中的层级                                                   |
| parentNid    | string | 父级 id                                                            |

---

## API

通过访问`window.freelogApp`调用 API，如`window.freelogApp.getStaticPath()`。

### 获取静态资源的路径

??? 使用场景是什么

**接口： getStaticPath**

传参说明：`getStaticPath(path)`

| 参数 | 必选 | 类型   | 说明             |
| :--- | :--- | :----- | :--------------- |
| path | 是   | string | ??? 这是什么路径 |

返回说明：

| 字段 | 类型   | 说明 |
| :--- | :----- | :--- |
| path | string | 路径 |

### 获取主题子依赖

??? 使用场景是什么

**接口： getSubDep**

传参说明：`getSubDep()`

返回说明：

??? 为什么不直接返回 subDep，要把整个主题数据返回过来？

| 字段   | 类型  | 说明         |
| :----- | :---- | :----------- |
| ...    | ...   | ...          |
| subDep | Dep[] | 依赖插件数据 |
| ...    | ...   | ...          |

### 渲染插件

**接口： mountWidget**

传参说明：`mountWidget(widget, container, parent, config, seq, widget_entry)`

TODO:细化参数

| 参数         | 必选 | 类型   | 说明                                              |
| :----------- | :--- | :----- | :------------------------------------------------ |
| widget       | 是   | object | 插件数据                                          |
| container    | 是   | object | 挂载容器                                          |
| parent       | 是   | object | 父数据                                            |
| config       | 是   | object | 子插件配置数据                                    |
| seq          | 否   | string | 多个同样的子插件需要传递序号，以区分插件          |
| widget_entry | 否   | string | 本地 url（dev 模式下可以使用本地 url 调试子插件） |

返回说明：

| 字段             | 类型     | 说明                                                                                                                                                           |
| :--------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| mount            | function | 渲染                                                                                                                                                           |
| unmount          | function | 卸载                                                                                                                                                           |
| update           | function | 更新                                                                                                                                                           |
| getStatus        | function | 获取插件状态（NOT_BOOTSTRAPPED：未初始化，BOOTSTRAPPING：初始化中，NOT_MOUNTED：未挂载，MOUNTED：已挂载至 DOM，UNMOUNTING：卸载中，SKIP_BECAUSE_BROKEN：异常） |
| loadPromise      | function | 返回一个 promise，当插件被加载 resolve                                                                                                                         |
| bootstrapPromise | function | 返回一个 promise，当插件初始化 resolve                                                                                                                         |
| mountPromise     | function | 返回一个 promise，当插件挂载后 resolve                                                                                                                         |
| unmountPromise   | function | 返回一个 promise，当插件卸载后 resolve                                                                                                                         |

### 获取展品列表

**接口： getExhibitListByPaging**

传参说明：`getExhibitListByPaging(params)`

| 参数                         | 必选 | 类型       | 说明                                                                          |
| :--------------------------- | :--- | :--------- | :---------------------------------------------------------------------------- |
| params                       | 否   | object     | ---                                                                           |
| \*\* skip                    | 否   | number     | 跳过的数量（默认为 0）                                                        |
| \*\* limit                   | 否   | number     | 本次请求的数据条数（不超过 100）                                              |
| \*\* sort                    | 否   | string     | 排序方式，格式为{排序字段}:{1 或-1}，1 是正序，-1 是倒序（如"updateDate:-1"） |
| \*\* articleResourceTypes    | 否   | string     | 展品资源类型（多个以逗号分割）                                                |
| \*\* omitArticleResourceType | 否   | string     | 过滤掉的展品类型，与 resourceType 参数互斥                                    |
| \*\* onlineStatus            | 否   | number     | 上架状态（0：下架，1：上架，2：全部，默认为 1）                               |
| \*\* tags                    | 否   | string     | 展品标签（多个以逗号分割）                                                    |
| \*\* tagQueryType            | 否   | number     | tags 的查询方式（1：任意匹配一个标签，2：匹配所有标签，默认为 1）             |
| \*\* projection              | 否   | string     | 指定返回的字段（多个以逗号分割）                                              |
| \*\* keywords                | 否   | string     | 搜索关键字（支持模糊搜索）                                                    |
| \*\* isLoadVersionProperty   | 否   | IntBoolean | 是否返回版本数据（默认为 0）                                                  |

返回说明：

| 字段                  | 类型                   | 说明                                                               |
| :-------------------- | :--------------------- | :----------------------------------------------------------------- |
| exhibitId             | string                 | 展品 id                                                            |
| exhibitName           | string                 | 展品名称                                                           |
| exhibitTitle          | string                 | 展品标题                                                           |
| exhibitSubjectType    | number                 | 标的物类型（1：资源，2：展品，3：用户组）                          |
| tags                  | string[]               | 展品标签                                                           |
| coverImages           | string[]               | 展品封面图                                                         |
| version               | string                 | 展品版本号                                                         |
| onlineStatus          | number                 | 上架状态（0：下架，1：上架）                                       |
| status                | number                 | 状态（0：正常）                                                    |
| userId                | number                 | 节点商 id                                                          |
| nodeId                | number                 | 节点 id                                                            |
| createDate            | date                   | 创建时间                                                           |
| updateDate            | date                   | 更新时间                                                           |
| policies              | object[]               | 授权策略                                                           |
| \*\* policyId         | string                 | 策略 id                                                            |
| \*\* policyName       | string                 | 策略名称                                                           |
| \*\* status           | number                 | 策略状态（0：启用，1：未启用）                                     |
| articleInfo           | object                 | 展品实际挂载的作品信息                                             |
| \*\* articleId        | string                 | 作品 ID                                                            |
| \*\* articleName      | string                 | 作品名称                                                           |
| \*\* resourceType     | string[]               | 作品类型                                                           |
| \*\* articleType      | number                 | 作品类型（1：独立作品，2：组合作品，3：节点组合作品，4：存储对象） |
| \*\* articleOwnerId   | number                 | 作品所有者 id                                                      |
| \*\* articleOwnerName | string                 | 作品所有者名称                                                     |
| versionInfo           | object                 | 展品的版本信息（参数 isLoadVersionProperty 为 1 时返回）           |
| \*\* exhibitId        | string                 | 展品 id                                                            |
| \*\* exhibitProperty  | ExhibitVersionProperty | 展品的版本属性                                                     |
| \*\* dependencyTree   | ExhibitDependency[]    | 展品的依赖                                                         |

### 根据 id 获取展品

**接口： getExhibitListById**

传参说明：`getExhibitListById(params)`

| 参数                       | 必选 | 类型       | 说明                         |
| :------------------------- | :--- | :--------- | :--------------------------- |
| params                     | 是   | object     | ---                          |
| \*\* exhibitIds            | 是   | string     | 展品 id（多个以逗号分割）    |
| \*\* isLoadVersionProperty | 否   | IntBoolean | 是否返回版本数据（默认为 0） |

返回说明：

| 字段                  | 类型                   | 说明                                                               |
| :-------------------- | :--------------------- | :----------------------------------------------------------------- |
| exhibitId             | string                 | 展品 id                                                            |
| exhibitName           | string                 | 展品名称                                                           |
| exhibitTitle          | string                 | 展品标题                                                           |
| exhibitSubjectType    | number                 | 标的物类型（1：资源，2：展品，3：用户组）                          |
| tags                  | string[]               | 展品标签                                                           |
| coverImages           | string[]               | 展品封面图                                                         |
| version               | string                 | 展品版本号                                                         |
| onlineStatus          | number                 | 上架状态（0：下架，1：上架）                                       |
| status                | number                 | 状态（0：正常）                                                    |
| userId                | number                 | 节点商 id                                                          |
| nodeId                | number                 | 节点 id                                                            |
| createDate            | date                   | 创建时间                                                           |
| updateDate            | date                   | 更新时间                                                           |
| policies              | object[]               | 授权策略                                                           |
| \*\* policyId         | string                 | 策略 id                                                            |
| \*\* policyName       | string                 | 策略名称                                                           |
| \*\* status           | number                 | 策略状态（0：启用，1：未启用）                                     |
| articleInfo           | object                 | 展品实际挂载的作品信息                                             |
| \*\* articleId        | string                 | 作品 ID                                                            |
| \*\* articleName      | string                 | 作品名称                                                           |
| \*\* resourceType     | string[]               | 作品类型                                                           |
| \*\* articleType      | number                 | 作品类型（1：独立作品，2：组合作品，3：节点组合作品，4：存储对象） |
| \*\* articleOwnerId   | number                 | 作品所有者 id                                                      |
| \*\* articleOwnerName | string                 | 作品所有者名称                                                     |
| versionInfo           | object                 | 展品的版本信息（参数 isLoadVersionProperty 为 1 时返回）           |
| \*\* exhibitId        | string                 | 展品 id                                                            |
| \*\* exhibitProperty  | ExhibitVersionProperty | 展品的版本属性                                                     |
| \*\* dependencyTree   | ExhibitDependency[]    | 展品的依赖                                                         |

### 获取展品详情

**接口： getExhibitInfo**

传参说明：`getExhibitInfo(exhibitId, query)`

| 参数                       | 必选 | 类型       | 说明                         |
| :------------------------- | :--- | :--------- | :--------------------------- |
| exhibitId                  | 是   | string     | 展品 id                      |
| query                      | 否   | object     | ---                          |
| \*\* isLoadVersionProperty | 否   | IntBoolean | 是否返回版本数据（默认为 0） |

返回说明：

| 字段                  | 类型                   | 说明                                                               |
| :-------------------- | :--------------------- | :----------------------------------------------------------------- |
| exhibitId             | string                 | 展品 id                                                            |
| exhibitName           | string                 | 展品名称                                                           |
| exhibitTitle          | string                 | 展品标题                                                           |
| exhibitSubjectType    | number                 | 标的物类型（1：资源，2：展品，3：用户组）                          |
| tags                  | string[]               | 展品标签                                                           |
| coverImages           | string[]               | 展品封面图                                                         |
| version               | string                 | 展品版本号                                                         |
| onlineStatus          | number                 | 上架状态（0：下架，1：上架）                                       |
| status                | number                 | 状态（0：正常）                                                    |
| userId                | number                 | 节点商 id                                                          |
| nodeId                | number                 | 节点 id                                                            |
| createDate            | date                   | 创建时间                                                           |
| updateDate            | date                   | 更新时间                                                           |
| policies              | object[]               | 授权策略                                                           |
| \*\* policyId         | string                 | 策略 id                                                            |
| \*\* policyName       | string                 | 策略名称                                                           |
| \*\* status           | number                 | 策略状态（0：启用，1：未启用）                                     |
| articleInfo           | object                 | 展品实际挂载的作品信息                                             |
| \*\* articleId        | string                 | 作品 ID                                                            |
| \*\* articleName      | string                 | 作品名称                                                           |
| \*\* resourceType     | string[]               | 作品类型                                                           |
| \*\* articleType      | number                 | 作品类型（1：独立作品，2：组合作品，3：节点组合作品，4：存储对象） |
| \*\* articleOwnerId   | number                 | 作品所有者 id                                                      |
| \*\* articleOwnerName | string                 | 作品所有者名称                                                     |
| versionInfo           | object                 | 展品的版本信息（参数 isLoadVersionProperty 为 1 时返回）           |
| \*\* exhibitId        | string                 | 展品 id                                                            |
| \*\* exhibitProperty  | ExhibitVersionProperty | 展品的版本属性                                                     |
| \*\* dependencyTree   | ExhibitDependency[]    | 展品的依赖                                                         |

### 获取展品资源文件

**接口： getExhibitFileStream**

传参说明：`getExhibitFileStream(exhibitId, returnUrl, config)`

| 参数      | 必选 | 类型    | 说明                                 |
| :-------- | :--- | :------ | :----------------------------------- |
| exhibitId | 是   | string  | 展品 id                              |
| returnUrl | 否   | boolean | 是否直接返回 url（媒体资源使用 url） |
| config    | 否   | any     | 对应 axios 的 config 参数            |

返回说明：

| 字段 | 类型   | 说明          |
| :--- | :----- | :------------ |
| data | string | 文件内容/链接 |

### 获取展品子依赖资源文件

**接口： getExhibitDepFileStream**

传参说明：`getExhibitDepFileStream(exhibitId, parentNid, subArticleIdOrName, returnUrl, config)`

| 参数               | 必选 | 类型    | 说明                                 |
| :----------------- | :--- | :------ | :----------------------------------- |
| exhibitId          | 是   | string  | 展品 id                              |
| parentNid          | 是   | string  | 链路 id                              |
| subArticleIdOrName | 是   | string  | 子依赖作品 id 或名称                 |
| returnUrl          | 否   | boolean | 是否直接返回 url（媒体资源使用 url） |
| config             | 否   | any     | 对应 axios 的 config 参数            |

返回说明：

| 字段 | 类型   | 说明          |
| :--- | :----- | :------------ |
| data | string | 文件内容/链接 |

### 获取展品签约数

**接口： getExhibitSignCount**

传参说明：`getExhibitSignCount(exhibitIds)`

| 参数       | 必选 | 类型   | 说明                      |
| :--------- | :--- | :----- | :------------------------ |
| exhibitIds | 是   | string | 展品 id（多个以逗号分割） |

返回说明：

| 字段      | 类型   | 说明    |
| :-------- | :----- | :------ |
| subjectId | string | 展品 id |
| count     | number | 签约数  |

### 查询展品授权状态

**接口： getExhibitAuthStatus**

传参说明：`getExhibitAuthStatus(exhibitIds)`

| 参数       | 必选 | 类型   | 说明                      |
| :--------- | :--- | :----- | :------------------------ |
| exhibitIds | 是   | string | 展品 id（多个以逗号分割） |

返回说明：

| 字段                  | 类型    | 说明                                                                                                                                                     |
| :-------------------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| exhibitId             | string  | 展品 id                                                                                                                                                  |
| exhibitName           | string  | 展品名称                                                                                                                                                 |
| authCode              | number  | 授权码                                                                                                                                                   |
| defaulterIdentityType | number  | 授权不通过责任方（0：授权全链通过，1：资源，2：节点，3：资源、节点，4：用户未授权，5：用户未授权、资源，6：用户未授权、节点，7：用户未授权、资源、节点） |
| errorMsg              | string  | 错误信息                                                                                                                                                 |
| isAuth                | boolean | 是否授权通过                                                                                                                                             |
| referee               | number  | 做出授权结果的标的物服务类型                                                                                                                             |

### 统计展品签约量

**接口： getSignStatistics**

??? 使用场景？这个签约次数是什么什么签约次数，跟 signCount 有什么区别？
??? keywords 参数无效

传参说明：`getSignStatistics(keywords)`

| 参数     | 必选 | 类型   | 说明       |
| :------- | :--- | :----- | :--------- |
| keywords | 是   | string | 搜索关键字 |

返回说明：

| 字段           | 类型     | 说明          |
| :------------- | :------- | :------------ |
| subjectId      | string   | 标的物 id     |
| subjectName    | string   | 标的物名称    |
| policyIds      | string[] | 签约的策略 id |
| latestSignDate | date     | 最后签约时间  |
| count          | number   | 签约次数      |
| isAuth         | boolean  | 是否授权通过  |

### 获取当前 dev 数据

??? 使用场景？插件开发者似乎不需要，如开发者需要这个数据，需要把这个数据的参数说明清楚

**接口： devData**

### 自动加载自身的子插件

??? 使用场景是什么

**接口： autoMoutSubWdigets**

传参说明：`getSignStatistics(config)`

??? 参数说明

### 获取当前主题 id

??? 使用场景是什么

**接口： getSelfId**

传参说明：`getSelfId()`

返回说明：

| 字段 | 类型   | 说明    |
| :--- | :----- | :------ |
| id   | string | 主题 id |

### 获取自定义数据

**接口： getSelfConfig**

传参说明：`getSelfConfig()`

返回说明：

| 字段           | 类型    | 说明              |
| :------------- | :------ | :---------------- |
| fileSize       | number  | 文件大小          |
| fileSizeUnit   | string  | 文件大小单位      |
| hbfOnlyToTheme | boolean | ???               |
| historyFB      | boolean | ???               |
| mime           | string  | MIME              |
| scopedCss      | boolean | ???               |
| shadowDom      | boolean | ???               |
| ...            | ...     | ...（自定义选项） |

### 唤起授权弹窗

**接口： addAuth**

传参说明：`addAuth(exhibitId, options)`

| 参数           | 必选 | 类型    | 说明                                                                                                                              |
| :------------- | :--- | :------ | :-------------------------------------------------------------------------------------------------------------------------------- |
| exhibitId      | 是   | string  | 展品 id                                                                                                                           |
| options        | 否   | object  | ---                                                                                                                               |
| \*\* immediate | 否   | boolean | 是否立即唤起授权弹窗（默认为 false），如果不立即唤起弹窗，会将当前展品加入授权队列，之后可以通过 API `callAuth()`呼出弹窗批量授权 |

返回说明：

| 字段   | 类型   | 说明                                                                  |
| :----- | :----- | :-------------------------------------------------------------------- |
| data   | object | 错误数据（status 为 3 时返回）/展品数据（status 为 4 时返回）         |
| status | number | 授权结果（0：成功，1：失败，2：用户取消，3：数据错误，4：展品已下架） |

### 监听用户登录

**接口： onLogin**

传参说明：`onLogin(callback)`

| 参数     | 必选 | 类型     | 说明                                        |
| :------- | :--- | :------- | :------------------------------------------ |
| callback | 否   | function | 用户切换登录状态回调（通常此处需要 reload） |

### 获取当前登录的用户数据

**接口： getCurrentUser**

传参说明：`getCurrentUser()`

返回说明：

| 字段                 | 类型   | 说明                                 |
| :------------------- | :----- | :----------------------------------- |
| email                | string | 邮箱                                 |
| mobile               | string | 电话                                 |
| headImage            | string | 头像                                 |
| userType             | number | 用户类型（0：初始账户，1：内测账户） |
| status               | number | 状态                                 |
| username             | string | 用户名                               |
| userId               | string | 用户 id                              |
| tokenSn              | string | 当前 jwtToken 的令牌编号             |
| createDate           | date   | 注册时间                             |
| userDetail           | object | ---                                  |
| \*\* sex             | number | 性别（0：未知，1：男，2：女）        |
| \*\* birthday        | string | 生日                                 |
| \*\* occupation      | string | 职业                                 |
| \*\* areaCode        | string | 居住地编码                           |
| \*\* areaName        | string | 居住地                               |
| \*\* latestLoginDate | date   | 最后一次登录时间                     |
| \*\* latestLoginIp   | string | 最后一次登录 ip                      |
| \*\* reason          | string | 冻结原因                             |
| \*\* remark          | string | 冻结备注                             |
| \*\* intro           | string | 简介                                 |
| \*\* createDate      | date   | 注册时间                             |
| \*\* updateDate      | date   | 更新时间                             |

### 设置用户专属数据

**接口： setUserData**

传参说明：`setUserData(key, data)`

| 参数 | 必选 | 类型   | 说明 |
| :--- | :--- | :----- | :--- |
| key  | 是   | string | 键名 |
| data | 是   | any    | 值   |

### 获取用户专属数据

**接口： getUserData**

传参说明：`getUserData(key)`

| 参数 | 必选 | 类型   | 说明 |
| :--- | :--- | :----- | :--- |
| key  | 是   | string | 键名 |

返回说明：

| 字段 | 类型 | 说明     |
| :--- | :--- | :------- |
| data | any  | 设置的值 |

### 唤起登录弹窗

**接口： callLogin**

传参说明：`callLogin(callBack)`

| 参数     | 必选 | 类型     | 说明                                                    |
| :------- | :--- | :------- | :------------------------------------------------------ |
| callBack | 否   | function | 登录成功的回调（如不传回调，会在登录成功时自动 reload） |

### 唤起登出确认弹窗

**接口： callLoginOut**

传参说明：`callLoginOut()`

### 重载页面

??? 使用场景是什么？为什么不用 window.location.reload()

**接口： reload**

传参说明：`reload()`

### 监听登录用户切换

??? 这个 API 完全没效果

**接口： isUserChange**

传参说明：`isUserChange()`

### 设置 viewport 的 meta

??? 使用场景是什么？

**接口： setViewport**

传参说明：`setViewport(params)`

| 参数   | 必选 | 类型   | 说明           |
| :----- | :--- | :----- | :------------- |
| params | 是   | object | 对应 meta 对象 |

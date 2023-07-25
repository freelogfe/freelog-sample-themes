const MyWindow: any = window;

/** 获取展品列表请求参数 */
export interface GetExhibitListByPagingParams {
  skip: number; // 从第几个开始
  limit: number; // 取多少个
  articleResourceTypes?: string; // 资源类型
  tags?: string; // 展品和资源标签，多个使用","隔开
  keywords?: string; // 搜索关键字
  sort?: string; // 排序
  isLoadVersionProperty?: 0 | 1; // 是否加载版本属性
}

/** 搜索展品请求参数 */
export interface GetExhibitListByIdParams {
  exhibitIds: string; // 展品id，多个使用","隔开
  isLoadVersionProperty?: 0 | 1; // 是否加载版本信息
}

/** 获取展品信息请求参数 */
export interface GetExhibitInfoParams {
  isLoadVersionProperty?: 0 | 1; // 是否加载版本信息
}

/** 获取签约展品列表请求参数 */
export interface GetSignStatisticsParams {
  keywords: string; // 搜索关键词
}

/** 加载子插件参数 */
export interface MountWidgetParams {
  widget: any; // 插件数据
  container: any; // 挂载容器
  config?: any; // 配置数据
  widget_entry?: string; // 插件本地运行 url
}

/**
 * 获取展品列表
 * @param query GetExhibitListByPagingParams
 */
export const getExhibitListByPaging = (query: GetExhibitListByPagingParams) => {
  return MyWindow.freelogApp.getExhibitListByPaging(query);
};

/**
 * 搜索展品
 * @param query GetExhibitListByIdParams
 */
export const getExhibitListById = (query: GetExhibitListByIdParams) => {
  return MyWindow.freelogApp.getExhibitListById(query);
};

/**
 * 获取展品信息
 * @param id 展品id
 * @param query GetExhibitInfoParams
 */
export const getExhibitInfo = (id: string, query: GetExhibitInfoParams = {}) => {
  return MyWindow.freelogApp.getExhibitInfo(id, query);
};

/**
 * 获取签约展品列表
 * @param query GetSignStatisticsParams
 */
export const getSignStatistics = (query: GetSignStatisticsParams) => {
  return MyWindow.freelogApp.getSignStatistics(query);
};

/**
 * 获取展品签约数
 * @param ids 展品id（用英文逗号隔开）
 */
export const getExhibitSignCount = (ids: string) => {
  return MyWindow.freelogApp.getExhibitSignCount(ids);
};

/**
 * 获取展品资源文件流
 * @param exhibitId 展品id
 * @param returnUrl 是否只返回url， 例如img标签图片只需要url
 * @param config axios的config 目前仅支持"onUploadProgress", "onDownloadProgress", "responseType"
 */
export const getExhibitFileStream = (exhibitId: string, returnUrl?: boolean, config?: any) => {
  return MyWindow.freelogApp.getExhibitFileStream(exhibitId, returnUrl, config);
};

/**
 * 获取展品子依赖
 * @param exhibitId 展品id
 * @param parentNid 链路id
 * @param subArticleIdOrName 子依赖资源id或名称
 * @param returnUrl 是否只返回url， 例如img标签图片只需要url
 * @param config axios的config 目前仅支持"onUploadProgress", "onDownloadProgress", "responseType"
 */
export const getExhibitDepFileStream = (
  exhibitId: string | number,
  parentNid: string,
  subArticleIdOrName: string,
  returnUrl?: boolean,
  config?: any
) => {
  return MyWindow.freelogApp.getExhibitDepFileStream(exhibitId, parentNid, subArticleIdOrName, returnUrl, config);
};

/**
 * 查询展品授权状态
 * @param exhibitIds 展品id
 */
export const getExhibitAuthStatus = async (exhibitIds: string) => {
  return MyWindow.freelogApp.getExhibitAuthStatus(exhibitIds);
};

/**
 * 唤起授权弹窗
 * @param exhibitId 展品id
 */
export const addAuth = async (exhibitId: string) => {
  return MyWindow.freelogApp.addAuth(exhibitId, { immediate: true });
};

/** 获取当前登录的用户信息 */
export const getCurrentUser = () => {
  return MyWindow.freelogApp.getCurrentUser();
};

/** 唤起登录弹窗 */
export const callLogin = async () => {
  return MyWindow.freelogApp.callLogin();
};

/** 唤起登出弹窗 */
export const callLoginOut = async () => {
  return MyWindow.freelogApp.callLoginOut();
};

/** 获取主题自定义选项配置 */
export const getSelfConfig = async () => {
  return MyWindow.freelogApp.getSelfConfig();
};

/** 获取节点信息 */
export const getNodeInfo = () => {
  return MyWindow.freelogApp.nodeInfo;
};

/**
 * 加载子插件
 * @param query MountWidgetParams
 */
export const mountWidget = (query: MountWidgetParams) => {
  return MyWindow.freelogApp.mountWidget(query);
};

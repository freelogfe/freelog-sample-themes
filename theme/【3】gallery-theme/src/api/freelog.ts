import { freelogApp } from "freelog-runtime";

/** 获取展品列表请求参数 */
export interface GetExhibitListByPagingParams {
  skip: number; // 从第几个开始
  limit: number; // 取多少个
  articleResourceTypes: string; // 资源类型
  tags?: string; // 展品和资源标签，多个使用","隔开
  keywords?: string; // 搜索关键字
  sort?: string; // 排序
}

/** 搜索展品请求参数 */
export interface GetExhibitListByIdParams {
  exhibitIds: string; // 展品id，多个使用","隔开
  isLoadVersionProperty?: string; // 是否加载版本信息
}

/** 获取展品信息请求参数 */
export interface GetExhibitInfoParams {
  isLoadVersionProperty?: 0 | 1; // 是否需要展品版本属性
}

/** 获取签约展品列表请求参数 */
export interface GetSignStatisticsParams {
  keywords: string; // 搜索关键词
}

/** 加载子插件参数 */
export interface MountWidgetParams {
  widget: any; // 插件数据
  container: any; // 挂载容器
  topExhibitData: any; // 主题展品数据
  config?: any; // 配置数据
  widget_entry?: string; // 插件本地运行 url
}

/**
 * 获取展品列表
 * @param query GetExhibitListByPagingParams
 */
export const getExhibitListByPaging = (query: GetExhibitListByPagingParams) => {
  return freelogApp.getExhibitListByPaging(query);
};

/**
 * 搜索展品
 * @param query GetExhibitListByIdParams
 */
export const getExhibitListById = (query: GetExhibitListByIdParams) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return freelogApp.getExhibitListById(query);
};

/**
 * 获取展品信息
 * @param id 展品id
 * @param query GetExhibitInfoParams
 */
export const getExhibitInfo = (
  id: string,
  query: GetExhibitInfoParams = {}
) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return freelogApp.getExhibitInfo(id, query);
};

/**
 * 获取签约展品列表
 * @param query GetSignStatisticsParams
 */
export const getSignStatistics = (query: GetSignStatisticsParams) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return freelogApp.getSignStatistics(query);
};

/**
 * 获取展品签约数
 * @param ids 展品id（用英文逗号隔开）
 */
export const getExhibitSignCount = (ids: string) => {
  return freelogApp.getExhibitSignCount(ids);
};

/**
 * 获取展品资源文件流
 * @param exhibitId 展品id
 * @param returnUrl 是否只返回url， 例如img标签图片只需要url
 * @param config axios的config 目前仅支持"onUploadProgress", "onDownloadProgress", "responseType"
 */
export const getExhibitFileStream = (
  exhibitId: string,
  returnUrl?: boolean,
  config?: any
) => {
  return freelogApp.getExhibitFileStream(exhibitId, { returnUrl, config });
};

/**
 * 查询展品授权状态
 * @param exhibitIds 展品id
 */
export const getExhibitAuthStatus = async (exhibitIds: string) => {
  return freelogApp.getExhibitAuthStatus(exhibitIds);
};

/**
 * 唤起授权弹窗
 * @param exhibitId 展品id
 */
export const addAuth = async (exhibitId: string) => {
  return freelogApp.addAuth(exhibitId, { immediate: true });
};

/** 获取当前登录的用户信息 */
export const getCurrentUser = () => {
  return freelogApp.getCurrentUser();
};

/** 唤起登录弹窗 */
export const callLogin = async () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return freelogApp.callLogin();
};

/** 唤起登出弹窗 */
export const callLoginOut = async () => {
  return freelogApp.callLoginOut();
};

/** 获取主题自定义选项配置 */
export const getSelfConfig = async () => {
  return freelogApp.getSelfConfig();
};

/** 获取节点信息 */
export const getNodeInfo = () => {
  return freelogApp.nodeInfo;
};

/** 获取节点主题展品数据 */
export const getSubDep = () => {
  return freelogApp.getSubDep();
};

/**
 * 加载子插件
 * @param query MountWidgetParams
 */
export const mountWidget = (query: MountWidgetParams) => {
  return freelogApp.mountWidget(query);
};

/** 获取节点主题展品数据 */
export const getCurrentUrl = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return MyWindow.location.currentURL;
};

/** 推送任务消息埋点 */
export const pushMessage4Task = (data: {
  taskConfigCode: string;
  meta?: any;
}) => {
  return freelogApp.pushMessage4Task(data);
};

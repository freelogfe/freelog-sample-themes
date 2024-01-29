import { freelogApp } from "freelog-runtime"
// @ts-ignore
window.freelogApp = freelogApp
/** 获取展品列表 */
export const getExhibitListByPaging = (query) => {
  return window.freelogApp.getExhibitListByPaging(query);
};

/** 搜索展品 */
export const getExhibitListById = (query) => {
  return window.freelogApp.getExhibitListById(query);
};

/** 获取展品信息 */
export const getExhibitInfo = (id, query = {}) => {
  return window.freelogApp.getExhibitInfo(id, query);
};

/** 获取签约展品列表 */
export const getSignStatistics = (query) => {
  return window.freelogApp.getSignStatistics(query);
};

/**
 * 获取展品签约数
 * @param ids 展品id（用英文逗号隔开）
 */
export const getExhibitSignCount = (ids) => {
  return window.freelogApp.getExhibitSignCount(ids);
};

/**
 * 获取展品资源文件流
 * @param exhibitId 展品id
 * @param returnUrl 是否只返回url， 例如img标签图片只需要url
 * @param config axios的config 目前仅支持"onUploadProgress", "onDownloadProgress", "responseType"
 */
export const getExhibitFileStream = (exhibitId, returnUrl, config) => {
  return window.freelogApp.getExhibitFileStream(exhibitId, returnUrl, config);
};

/**
 * 查询展品授权状态
 * @param exhibitIds 展品id
 */
export const getExhibitAuthStatus = async (exhibitIds) => {
  return window.freelogApp.getExhibitAuthStatus(exhibitIds);
};

/**
 * 唤起授权弹窗
 * @param exhibitId 展品id
 */
export const addAuth = async (exhibitId) => {
  return window.freelogApp.addAuth(exhibitId, { immediate: true });
};

/** 获取当前登录的用户信息 */
export const getCurrentUser = () => {
  return window.freelogApp.getCurrentUser();
};

/** 获取用户存储数据 */
export const getUserData = async (key) => {
  return window.freelogApp.getUserData(key);
};

/** 更新用户存储数据 */
export const setUserData = async (key, data) => {
  return window.freelogApp.setUserData(key, data);
};

/** 唤起登录弹窗 */
export const callLogin = async () => {
  return window.freelogApp.callLogin();
};

/** 唤起登出弹窗 */
export const callLoginOut = async () => {
  return window.freelogApp.callLoginOut();
};

/** 获取主题自定义选项配置 */
export const getSelfConfig = async () => {
  return window.freelogApp.getSelfConfig();
};

/** 获取节点信息 */
export const getNodeInfo = () => {
  return window.freelogApp.nodeInfo;
};

/** 获取节点主题展品数据 */
export const getCurrentUrl = () => {
  return window.location.currentURL;
};

/** 推送任务消息埋点 */
export const pushMessage4Task = (data) => {
  return window.freelogApp.pushMessage4Task(data);
};

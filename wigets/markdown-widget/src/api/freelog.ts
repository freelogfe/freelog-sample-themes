const MyWindow: any = window;

/** 获取插件配置数据 */
export const getSelfConfig = async () => {
  return MyWindow.freelogApp.getSelfConfig();
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

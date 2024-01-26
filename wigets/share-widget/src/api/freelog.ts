const MyWindow: any = window;

/** 获取插件配置数据 */
export const getSelfConfig = async () => {
  return MyWindow.freelogApp.getSelfConfig();
};

/** 获取当前 url */
export const getCurrentUrl = () => {
  return MyWindow.location.currentURL;
};

/** 推送任务消息埋点 */
export const pushMessage4Task = (data: { taskConfigCode: string; meta?: any }) => {
  return MyWindow.freelogApp.pushMessage4Task(data);
};

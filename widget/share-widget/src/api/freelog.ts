import { freelogApp } from "freelog-runtime";

/** 获取插件配置数据 */
export const getSelfConfig = async () => {
  return freelogApp.getSelfConfig();
};

/** 获取当前 url */
export const getCurrentUrl = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return freelogApp.getCurrentUrl();
};

/** 推送任务消息埋点 */
export const pushMessage4Task = (data: {
  taskConfigCode: string;
  meta?: any;
}) => {
  return freelogApp.pushMessage4Task(data);
};

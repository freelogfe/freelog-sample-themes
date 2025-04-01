import { freelogApp } from "freelog-runtime";

/** 唤起登录弹窗 */
export const callLogin = async () => {
  return freelogApp.callLogin();
};

/** 唤起登出弹窗 */
export const callLoginOut = async () => {
  return freelogApp.callLoginOut();
};
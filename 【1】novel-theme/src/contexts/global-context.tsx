import React from "react";

/** 全局数据 */
export interface Global {
  inMobile: boolean | null;
  userData: UserData | null;
  selfConfig: any;
  theme: Theme;
  locationHistory: string[];
  nodeInfo: any;
}

/** 当前登录用户数据 */
export interface UserData {
  username: string;
  headImage: string;
  mobile: string;
  isLogin: boolean;
}

/** 主题数据 */
export interface Theme {
  gradientColor: string;
  deriveColor: string;
}

export const globalContext = React.createContext<Global>({
  inMobile: null,
  userData: null,
  selfConfig: {},
  theme: { gradientColor: "", deriveColor: "" },
  locationHistory: [],
  nodeInfo: {}
});

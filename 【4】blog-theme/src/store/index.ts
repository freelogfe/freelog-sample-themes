import { themeList } from "@/api/data";
import { judgeDevice, judgeIOSDevice } from "@/utils/common";
import { freelogApp } from "freelog-runtime";
import { createStore } from "vuex";

/** 当前登录用户数据 */
interface UserData {
  username: string;
  headImage: string;
  mobile: string;
  isLogin: boolean;
}

/** 主题数据 */
interface Theme {
  gradientColor: string;
  deriveColor: string;
}

/** 路由历史记录 */
interface HistoryItem {
  path: string;
  query?: any;
}

export default createStore({
  state: {
    inMobile: false as boolean,
    userData: null as UserData | null,
    selfConfig: {} as any,
    theme: { gradientColor: "", deriveColor: "" } as Theme,
    locationHistory: [] as HistoryItem[],
    authIds: [] as string[], // 授权集合，用于刷新列表授权状态
    isIOS: false,
    maskLoading: false
  },

  mutations: {
    /** 更新数据 */
    setData(state: any, payload: any) {
      state[payload.key] = payload.value;
    }
  },

  actions: {
    /** 初始化 store */
    async initData(context) {
      const userData = freelogApp.getCurrentUser();
      const selfConfig = await freelogApp.getSelfProperty();
      console.log("getSelfProperty", selfConfig);

      const inMobile = judgeDevice();

      if (inMobile) {
        // 是否 IOS 设备
        const isIOS = judgeIOSDevice();
        context.commit("setData", { key: "isIOS", value: isIOS });
      }

      const theme = themeList[selfConfig.theme || "沉静"];
      context.commit("setData", {
        key: "userData",
        value: userData ? { ...userData, isLogin: true } : { isLogin: false }
      });
      context.commit("setData", { key: "selfConfig", value: selfConfig });
      context.commit("setData", { key: "inMobile", value: inMobile });
      context.commit("setData", { key: "theme", value: theme });
      context.commit("setData", { key: "locationHistory", value: [] });

      const app = document.getElementById("app");
      app?.setAttribute(
        "style",
        `--gradientColor: ${theme.gradientColor}; --deriveColor: ${theme.deriveColor}`
      );
    }
  },

  modules: {}
});

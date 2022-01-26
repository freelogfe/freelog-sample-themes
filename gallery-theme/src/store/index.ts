import { themeList } from "@/api/data";
import { getSelfConfig, getCurrentUser } from "@/api/freelog";
import { ExhibitItem } from "@/api/interface";
import { judgeDevice } from "@/utils/common";
import { createStore } from "vuex";

// 用户信息
interface UserData {
  username: string;
  headImage: string;
  mobile: string;
  isLogin: boolean;
}

// 主题色
interface Theme {
  gradientColor: string;
  deriveColor: string;
}

// 路由记录
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
    listData: [] as ExhibitItem[],
    locationHistory: [] as HistoryItem[],
  },

  mutations: {
    setData(state: any, payload: any) {
      state[payload.key] = payload.value;
    },
  },

  actions: {
    async initData(context) {
      const userData = await getCurrentUser();
      const selfConfig = await getSelfConfig();
      const inMobile = judgeDevice();
      const theme = themeList[selfConfig.theme];
      context.commit("setData", {
        key: "userData",
        value: userData ? { ...userData, isLogin: true } : { isLogin: false },
      });
      context.commit("setData", { key: "selfConfig", value: selfConfig });
      context.commit("setData", { key: "inMobile", value: inMobile });
      context.commit("setData", { key: "theme", value: theme });
      context.commit("setData", { key: "locationHistory", value: [] });

      const app = document.getElementById("app");
      app?.setAttribute("style", `--gradientColor: ${theme.gradientColor}; --deriveColor: ${theme.deriveColor}`);
    },
  },

  modules: {},
});

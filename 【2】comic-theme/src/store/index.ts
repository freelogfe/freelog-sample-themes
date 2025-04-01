import { themeList } from "@/api/data";
import { ExhibitItem } from "@/api/interface";
import { judgeDevice, judgeIOSDevice } from "@/utils/common";
import { freelogApp } from "freelog-runtime";
import { createStore } from "vuex";

export interface State {
  inMobile: boolean;
  isIOS: boolean | null;
  userData: UserData | null;
  selfConfig: any;
  theme: Theme;
  locationHistory: HistoryItem[];
  shelfIds: string[];
  myShelf: ExhibitItem[] | null;
  authIds: string[]; // 授权集合，用于刷新列表授权状态
  maskLoading: boolean;
}

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

export default createStore<State>({
  state: {
    inMobile: false,
    isIOS: null, // 是否 IOS 设备
    userData: null,
    selfConfig: {},
    theme: { gradientColor: "", deriveColor: "" },
    locationHistory: [],
    shelfIds: [],
    myShelf: null,
    authIds: [], // 授权集合，用于刷新列表授权状态
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
    async initStoreData(context) {
      const userData = freelogApp.getCurrentUser();
      const selfConfig = await freelogApp.getSelfProperty();
      const inMobile = judgeDevice();
      const theme = themeList[selfConfig.options_theme || selfConfig.theme];

      if (inMobile) {
        // 是否 IOS 设备
        const isIOS = judgeIOSDevice();
        context.commit("setData", { key: "isIOS", value: isIOS });
      }
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

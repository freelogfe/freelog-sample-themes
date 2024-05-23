import { ExhibitItem } from "@/api/interface";
import { judgeDevice } from "@/utils/common";
import { freelogApp } from "freelog-runtime";
import { createStore } from "vuex";

/** 当前登录用户数据 */
interface UserData {
  username: string;
  headImage: string;
  mobile: string;
  isLogin: boolean;
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
    listData: [] as ExhibitItem[],
    locationHistory: [] as HistoryItem[],
  },

  mutations: {
    /** 更新数据 */
    setData(state: any, payload: any) {
      state[payload.key] = payload.value;
    },
  },

  actions: {
    /** 初始化 store */
    async initData(context) {
      const userData = await freelogApp.getCurrentUser();
      const selfConfig = await freelogApp.getSelfProperty();
      const inMobile = judgeDevice();
      context.commit("setData", {
        key: "userData",
        value: userData ? { ...userData, isLogin: true } : { isLogin: false },
      });
      context.commit("setData", { key: "selfConfig", value: selfConfig });
      context.commit("setData", { key: "inMobile", value: inMobile });
      context.commit("setData", { key: "locationHistory", value: [] });
    },
  },

  modules: {},
});

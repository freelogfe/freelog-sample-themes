import { getSelfConfig, getCurrentUser } from "@/api/freelog";
import { ExhibitItem } from "@/api/interface";
import { judgeDevice } from "@/utils/common";
import { createStore } from "vuex";

// 用户信息
interface UserData {
  username: string;
  headImage: string;
  mobile: string;
}

export default createStore({
  state: {
    inMobile: false as boolean,
    userData: null as UserData | null,
    selfConfig: {} as any,
    listData: [] as ExhibitItem[],
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
      context.commit("setData", { key: "userData", value: userData });
      context.commit("setData", { key: "selfConfig", value: selfConfig });
      context.commit("setData", { key: "inMobile", value: inMobile });
    },
  },

  modules: {},
});

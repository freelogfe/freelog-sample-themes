import { themeList } from "@/api/data";
import { getSelfConfig, getCurrentUser } from "@/api/freelog";
import { judgeDevice } from "@/utils/common";
import { createStore } from "vuex";

// 用户信息
interface UserData {
  username: string;
  headImage: string;
  mobile: string;
}

// 主题色
interface Theme {
  gradientColor: string;
  deriveColor: string;
}

export default createStore({
  state: {
    inMobile: false as boolean,
    userData: null as UserData | null,
    selfConfig: {} as any,
    theme: { gradientColor: "", deriveColor: "" } as Theme,
  },
  mutations: {},
  actions: {
    async initData() {
      this.state.userData = await getCurrentUser();
      this.state.selfConfig = await getSelfConfig();
      this.state.inMobile = judgeDevice();
      const theme = themeList[this.state.selfConfig.theme];
      this.state.theme = theme;
      const app = document.getElementById("app");
      app?.setAttribute("style", `--gradientColor: ${theme.gradientColor}; --deriveColor: ${theme.deriveColor}`);
    },
  },
  modules: {},
});

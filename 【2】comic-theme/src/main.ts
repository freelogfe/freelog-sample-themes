import "./public-path";
import { App, createApp } from "vue";
import * as VueRouter from "vue-router";
import AppPage from "./App.vue";
import routes from "./router";
import store from "./store";
import lazyPlugin from "vue3-lazy";
import { freelogApp, initFreelogApp } from "freelog-runtime";
import mapRoutes from "@/utils/map-routes";
import { scrollIntoView, sleep } from "@/utils/common";

const myWindow: any = window;
let app: App<Element> | null = null;
let router: VueRouter.Router | null = null;
let history: VueRouter.RouterHistory | null = null;

myWindow.mount = () => {
  initFreelogApp();
  /* 路由映射 */
  freelogApp.mapShareUrl(mapRoutes);
  /* 修复ios的safari浏览器, 软键盘将页面顶到安全区域外的问题
   * 方式一: scrollIntoView
   * 方式二: v-if重渲染全部页面
   */
  // 登录成功后, 使用方式二
  // 关闭登录框, 使用方式一
  (freelogApp as any).onLogin(
    async () => {
      if (store.state.isIOS) {
        store.commit("setData", {
          key: "maskLoading",
          value: true
        });
        await sleep(350);
        store.commit("setData", {
          key: "maskLoading",
          value: false
        });
      }
      const url = freelogApp.getCurrentUrl();
      location.href = url;
    },
    () => {
      if (store.state.isIOS) {
        scrollIntoView();
      }
    }
  );

  history = VueRouter.createWebHistory();
  router = VueRouter.createRouter({
    history,
    routes
  });

  app = createApp(AppPage);
  app.use(router).use(store).use(lazyPlugin, {});
  app.mount("#app");
  store.dispatch("initStoreData");
};

myWindow.unmount = () => {
  app?.unmount();
  history?.destroy();
  app = null;
  router = null;
  history = null;
};

if (!myWindow.__MICRO_APP_ENVIRONMENT__) {
  myWindow.mount();
}

import { createApp, watch } from "vue";
import { createPinia } from "pinia";
import { useGlobalStore } from "@/store/global";
import { freelogApp, initFreelogApp } from "freelog-runtime";
import mapRoutes from "@/utils/map-routes";
// 导入主题初始化函数
import { initTheme } from "@/utils/theme-manager";
// 导入主题样式
import "@/assets/css/theme.less";

import App from "./App.vue";
import router from "./router";

window.mount = async () => {
  const isMicroApp = !window.__MICRO_APP_ENVIRONMENT__;
  console.log(isMicroApp ? "%c独立模块" : "%c子应用", "color:red; padding:10px; font-size: 15px");

  initFreelogApp();
  /* 路由映射: mapShareUrl会调用映射函数得到地址, 并异步导航  */
  await freelogApp.mapShareUrl(mapRoutes);

  const pinia = createPinia();
  const app = createApp(App);
  app.use(pinia);
  app.use(router);
  app.mount("#app");

  const store = useGlobalStore();
  await store.initStoreData();

  // 初始化主题
  initTheme();

  // 函数侦听整个 state
  watch(
    pinia.state,
    state => {
      // 每当状态发生变化时，将整个 state 持久化到本地存储。
      // console.log("%cState Is", "color:red; padding:10px; font-size: 15px", state.global.shareInfo);
      // console.log("%chahha", "color:red; padding:10px; font-size: 15px", state.global.playList);
    },
    { deep: true }
  );
};

window.unmount = () => {};

if (!window.__MICRO_APP_ENVIRONMENT__) {
  window.mount();
}

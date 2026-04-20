import { createApp, watch } from "vue";
import { createPinia } from "pinia";
import { useGlobalStore } from "@/store/global";
import { freelogApp, initFreelogApp } from "freelog-runtime";
import mapRoutes from "@/utils/map-routes";
import { scrollIntoView, sleep } from "@/utils/common";
// 导入主题初始化函数
import { initTheme } from "@/utils/theme-manager";
// 导入主题样式
import "@/assets/css/theme.less";

import App from "./App.vue";
import router from "./router";

let app: any = null;

window.mount = async () => {
  const isMicroApp = !window.__MICRO_APP_ENVIRONMENT__;
  console.log(isMicroApp ? "%c独立模块" : "%c子应用", "color:red; padding:10px; font-size: 15px");

  initFreelogApp();
  /* 路由映射: mapShareUrl会调用映射函数得到地址, 并异步导航  */
  await freelogApp.mapShareUrl(mapRoutes);

  const pinia = createPinia();
  app = createApp(App);
  app.use(pinia);
  app.use(router);

  const store = useGlobalStore();
  await store.initStoreData();

  /* 修复ios的safari浏览器, 软键盘将页面顶到安全区域外的问题
   * 方式一: scrollIntoView
   * 方式二: v-if重渲染全部页面
   */
  // 登录成功后, 使用方式二
  // 关闭登录框, 使用方式一
  (freelogApp as any).onLogin(
    async () => {
      if (store.$state.isIOS) {
        store.setData({ key: "maskLoading", value: true });
        await sleep(350);
        store.setData({ key: "maskLoading", value: false });
      }
      const url = freelogApp.getCurrentUrl();
      location.href = url;
      freelogApp.reload();
    },
    () => {
      if (store.$state.isIOS) {
        scrollIntoView();
      }
    }
  );

  app.mount("#app");

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

window.unmount = () => {
  app?.unmount();
  app = null;
};

if (!window.__MICRO_APP_ENVIRONMENT__) {
  window.mount();
}

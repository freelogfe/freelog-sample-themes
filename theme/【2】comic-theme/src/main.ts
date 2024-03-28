import "./public-path";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import routes from "./router";
import store from "./store";
import lazyPlugin from "vue3-lazy";
import { freelogApp,initFreelogApp } from "freelog-runtime";

// const myWindow: any = window;
// freelogApp.setSelfResourceNameForDev("ZhuC/comic-theme");
// myWindow.freelogApp.onLogin(() => myWindow.location.reload());

// const router = createRouter({ history: createWebHistory(), routes });
// createApp(App).use(router).use(store).use(lazyPlugin, {}).mount("#app");
// store.dispatch("initStoreData");

// if (myWindow.__POWERED_BY_WUJIE__) {
//   let instance: any;
//   myWindow.__WUJIE_MOUNT = () => {
//     const router = createRouter({ history: createWebHistory(), routes });
//     instance = createApp(App).use(router).use(store).use(lazyPlugin, {}).mount("#app");
//     store.dispatch("initStoreData");
//   };
//   myWindow.__WUJIE_UNMOUNT = () => {
//     instance.unmount();
//   };
// } else {
//   const router = createRouter({ history: createWebHistory(), routes });
//   createApp(App).use(router).use(store).use(lazyPlugin, {}).mount("#app");
//   store.dispatch("initStoreData");
// }
// myWindow.FREELOG_RESOURCENAME = "ZhuC/gallery-theme";

let instance: any = null;
let router = null;

function render() {
  router = createRouter({ history: createWebHistory(), routes });
  instance = createApp(App)
    .use(router)
    .use(store)
    .use(lazyPlugin, {})
    .mount("#app");
  store.dispatch("initStoreData");
}

// 👇 将渲染操作放入 mount 函数，子应用初始化时会自动执行
window.mount = () => {
  initFreelogApp()
  freelogApp.onLogin(() => window.location.reload());
  render();
};

// 👇 将卸载操作放入 unmount 函数，就是上面步骤2中的卸载函数
window.unmount = () => {
  instance.unmount();
  instance._container.innerHTML = "";
  instance = null;
  router = null;
};

// 如果不在微前端环境，则直接执行mount渲染
if (!window.__MICRO_APP_ENVIRONMENT__) {
  window.mount();
}

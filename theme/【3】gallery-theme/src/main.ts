import "./public-path";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import routes from "./router";
import store from "./store";
import lazyPlugin from "vue3-lazy";
import { freelogApp } from "freelog-runtime";

// myWindow.FREELOG_RESOURCENAME = "ZhuC/gallery-theme";
freelogApp.onLogin(() => freelogApp.reload());

let instance: any = null;
let router = null;

function render(props: any = {}) {
  router = createRouter({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    history: createWebHistory(process.env.BASE_URL),
    routes,
  });
  instance = createApp(App).use(router).use(store).use(lazyPlugin, {});
  instance.mount(document.querySelector("#app"));
  store.dispatch("initStoreData");
}

// 👇 将渲染操作放入 mount 函数，子应用初始化时会自动执行
window.mount = () => {
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

import "./public-path";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import routes from "./router";
import store from "./store";
import lazyPlugin from "vue3-lazy";
import hljs from "highlight.js";
import "highlight.js/styles/a11y-dark.css";
import { freelogApp, initFreelogApp } from "freelog-runtime";

// myWindow.FREELOG_RESOURCENAME = "ZhuC/blog-theme";

let instance: any = null;
let router = null;

function render() {
  router = createRouter({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    history: createWebHistory(process.env.BASE_URL),
    routes,
  });
  instance = createApp(App).use(router).use(store).use(lazyPlugin, {});
  instance.mount(document.querySelector("#app"));
  store.dispatch("initData");

  // 定义⾃定义指令 highlight 代码⾼亮
  instance.directive(
    "highlight",
    function (el: { querySelectorAll: (arg0: string) => any }) {
      const blocks = el.querySelectorAll("pre code");
      blocks.forEach((block: any) => {
        hljs.highlightBlock(block);
      });
    }
  );
}

// 👇 将渲染操作放入 mount 函数，子应用初始化时会自动执行
window.mount = () => {
  initFreelogApp()
  freelogApp.onLogin(() => freelogApp.reload());

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

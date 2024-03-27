import "./public-path";
import { createApp } from "vue";
import { createRouter, createMemoryHistory } from "vue-router";
import App from "./App.vue";
import routes from "./router";
import { createPinia } from "pinia";
import { useStore } from "./store";
import hljs from "highlight.js";
import "highlight.js/styles/a11y-dark.css";
import { freelogApp } from "freelog-runtime";

const myWindow: any = window;
myWindow.FREELOG_RESOURCENAME = "ZhuC/markdown-widget";

let instance: any = null;
let router = null;

function render() {
  router = createRouter({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    history: createMemoryHistory(process.env.BASE_URL),
    routes,
  });
  instance = createApp(App).use(router).use(createPinia());
  instance.mount(document.querySelector("#markdown-widget-app"));

  hljs.configure({
    ignoreUnescapedHTML: true,
  });

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
  freelogApp.registerApi({
    setData: (key: string, value: any) => {
      const store = useStore();
      store.setData(key, value);
    },
  });
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

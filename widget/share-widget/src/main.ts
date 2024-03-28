import "./public-path";
import { createApp } from "vue";
import { createRouter, createMemoryHistory } from "vue-router";
import App from "./App.vue";
import routes from "./router";
import { createPinia } from "pinia";
import { useStore } from "./store";
import { freelogApp, initFreelogApp } from "freelog-runtime";

// const myWindow: any = window;
// myWindow.FREELOG_RESOURCENAME = "ZhuC/share-widget";

let instance: any = null;
let router = null;

function render(props: any = {}) {
  const { container } = props;
  router = createRouter({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    history: createMemoryHistory(process.env.BASE_URL),
    routes,
  });
  instance = createApp(App).use(router).use(createPinia());
  instance.mount(
    container
      ? container.querySelector("#share-widget-app")
      : "#share-widget-app"
  );
}

// 👇 将渲染操作放入 mount 函数，子应用初始化时会自动执行
window.mount = () => {
  initFreelogApp()
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

/* eslint-disable */
import "./public-path";
import { createApp } from "vue";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

import App from "./App.vue";
import routes from "./router";
import store from "./store";
import lazyPlugin from "vue3-lazy";

let myWindow: any = window;

myWindow.FREELOG_RESOURCENAME = "ZhuC/blog-theme";

myWindow.freelogApp.onLogin(() => {
  myWindow.location.reload();
});
let instance: any = null;
let router = null
function render(props: any = {}) {
  const { container } = props;
  router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
  });
  instance = createApp(App).use(router).use(store).use(lazyPlugin, {
    // loading: require("./assets/image/default-img.jpg"),
    // error: require("./assets/image/default-img.jpg"),
  });
  instance.mount(container ? container.querySelector("#app") : "#app");
  store.dispatch("initData");
}

if (!myWindow.__POWERED_BY_FREELOG__) {
  render();
}

export async function bootstrap() {
  console.log("%c ", "color: green;", "vue3.0 app bootstraped");
}

export async function mount(props: { onGlobalStateChange: any; setGlobalState: any }) {
  storeTest(props);
  render(props);
  if (instance.config) {
    instance.config.globalProperties.$onGlobalStateChange = props.onGlobalStateChange;
    instance.config.globalProperties.$setGlobalState = props.setGlobalState;
  }
}

export async function unmount() {
  instance.unmount();
  instance._container.innerHTML = "";
  instance = null;
  router = null;
}

// 插件通信功能暂未测试
function storeTest(props: { onGlobalStateChange: any; setGlobalState: any; name?: any }) {
  props.onGlobalStateChange &&
    props.onGlobalStateChange(
      (value: any, prev: any) => console.log(`[onGlobalStateChange - ${props.name}]:`, value, prev),
      true
    );
  props.setGlobalState &&
    props.setGlobalState({
      ignore: props.name,
      user: {
        name: props.name,
      },
    });
}
/* eslint-disable */

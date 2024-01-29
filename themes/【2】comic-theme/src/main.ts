import "./public-path";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import routes from "./router";
import store from "./store";
import lazyPlugin from "vue3-lazy";
import { freelogApp } from "freelog-runtime"

const myWindow: any = window;

myWindow.FREELOG_RESOURCENAME = "ZhuC/comic-theme";
freelogApp.onLogin(() => freelogApp.reload());

let instance: any = null;
let router = null;

function render() {
  router = createRouter({
    history: createWebHistory("/"),
    routes,
  });
  instance = createApp(App).use(router).use(store).use(lazyPlugin, {});
  instance.mount(document.querySelector("#app"));
  store.dispatch("initStoreData");
}

function unmount() {
  instance.unmount();
  instance._container.innerHTML = "";
  instance = null;
  router = null;
}

if (window.__POWERED_BY_WUJIE__) {
  let instance;
  window.__WUJIE_MOUNT = () => {
    render()
  };
  window.__WUJIE_UNMOUNT = () => {
    unmount();
  };
} else {
  render()
}
import "./public-path";
import { createApp } from "vue";
import { createRouter, createMemoryHistory } from "vue-router";
import App from "./App.vue";
import routes from "./router";
import { createPinia } from "pinia";
import { useStore } from "./store";

const myWindow: any = window;
myWindow.FREELOG_RESOURCENAME = "ZhuC/share-widget";

let instance: any = null;
let router = null;

function render() {
  router = createRouter({
    history: createMemoryHistory("/"),
    routes,
  });
  instance = createApp(App).use(router).use(createPinia());
  instance.mount(document.querySelector("#share-widget-app"));
}
 
if (window.__POWERED_BY_WUJIE__) {
  window.__WUJIE_MOUNT = () => {
    window.$wujie?.props.registerApi({
      setData: (key: string, value: any) => {
        const store = useStore();
        store.setData(key, value);
      },
    });
    render();
  };
  window.__WUJIE_UNMOUNT = () => {
    instance.unmount();
    instance._container.innerHTML = "";
    instance = null;
    router = null;
  };
} else {
  render();
}
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

function render(props: any = {}) {
  const { container } = props;
  router = createRouter({
    history: createMemoryHistory(process.env.BASE_URL),
    routes,
  });
  instance = createApp(App).use(router).use(createPinia());
  instance.mount(container ? container.querySelector("#share-widget-app") : "#share-widget-app");
}

if (!myWindow.__POWERED_BY_FREELOG__) {
  render();
}

export async function bootstrap() {
  console.log("widget bootstraped");
}

export async function mount(props: any) {
  props.registerApi({
    setData: (key: string, value: any) => {
      const store = useStore();
      store.setData(key, value);
    },
  });
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

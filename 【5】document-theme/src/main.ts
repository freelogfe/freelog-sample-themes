import "./public-path";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import routes from "./router";
import store from "./store";
import hljs from "highlight.js";
import "highlight.js/styles/a11y-dark.css";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

const myWindow: any = window;

myWindow.FREELOG_RESOURCENAME = "ZhuC/document-theme";
myWindow.freelogApp.onLogin(() => myWindow.location.reload());

let instance: any = null;
let router = null;

function render(props: any = {}) {
  const { container } = props;
  router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
  });
  instance = createApp(App).use(router).use(store).use(ElementPlus);
  instance.mount(container ? container.querySelector("#app") : "#app");
  store.dispatch("initData");

  // 定义⾃定义指令 highlight 代码⾼亮
  instance.directive("highlight", function (el: { querySelectorAll: (arg0: string) => any }) {
    const blocks = el.querySelectorAll("pre code");
    blocks.forEach((block: any) => {
      hljs.highlightBlock(block);
    });
  });
}

if (!myWindow.__POWERED_BY_FREELOG__) {
  render();
}

export async function bootstrap() {
  console.log("vue app bootstraped");
}

export async function mount(props: { onGlobalStateChange: any; setGlobalState: any }) {
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

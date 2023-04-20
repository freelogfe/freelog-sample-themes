/* eslint-disable */
import "./public-path";
import { createApp } from "vue";
import App from "./App.vue";

let myWindow: any = window;

let instance: any = null;

function render(props: any = {}) {
  const { container } = props;
  instance = createApp(App)
  instance.mount(container ? container.querySelector("#app") : "#app");
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

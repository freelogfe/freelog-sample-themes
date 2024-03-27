import "./public-path";
import { createApp } from "vue";
import App from "./App.vue";

const myWindow: any = window;
let instance: any = null;

function render(props: any = {}) {
  const { container } = props;
  instance = createApp(App);
  instance.mount(container ? container.querySelector("#app") : "#app");
}

if (!myWindow.__MICRO_APP_ENVIRONMENT__) {
  render();
}

export async function bootstrap() {
  console.log("%c ", "color: green;", "vue3.0 app bootstraped");
}

export async function mount(props: any) {
  render(props);
  if (instance.config) {
    const { onGlobalStateChange, setGlobalState } = props;
    instance.config.globalProperties.$onGlobalStateChange = onGlobalStateChange;
    instance.config.globalProperties.$setGlobalState = setGlobalState;
  }
}

export async function unmount() {
  instance.unmount();
  instance._container.innerHTML = "";
  instance = null;
}

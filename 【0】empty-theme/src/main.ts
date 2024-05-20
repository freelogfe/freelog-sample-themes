import "./public-path";
import { createApp } from "vue";
import App from "./App.vue";

const myWindow: any = window;
let app: any = null;

myWindow.mount = () => {
  app = createApp(App);
  app.mount("#app");
};

myWindow.unmount = () => {
  app.unmount();
  app._container.innerHTML = "";
  app = null;
};

if (!myWindow.__MICRO_APP_ENVIRONMENT__) {
  myWindow.mount();
}

import "./public-path";
import { App, createApp } from "vue";
import AppPage from "./App.vue";

const myWindow: any = window;
let app: App<Element> | null = null;

myWindow.mount = () => {
  app = createApp(AppPage);
  app.mount("#app");
};

myWindow.unmount = () => {
  app?.unmount();
  app = null;
};

if (!myWindow.__MICRO_APP_ENVIRONMENT__) {
  myWindow.mount();
}

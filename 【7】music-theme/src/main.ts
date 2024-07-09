import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

window.mount = () => {
  const isMicroApp = !window.__MICRO_APP_ENVIRONMENT__;
  console.log(isMicroApp ? "%c独立模块" : "%c子应用", "color:red; padding:10px; font-size: 15px");

  const app = createApp(App);
  app.use(router);
  app.mount("#app");
};

window.unmount = () => {};

if (!window.__MICRO_APP_ENVIRONMENT__) {
  window.mount();
}

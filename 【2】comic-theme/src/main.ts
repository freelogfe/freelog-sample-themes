import "./public-path";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import routes from "./router";
import store from "./store";
import lazyPlugin from "vue3-lazy";
import { freelogApp } from "freelog-runtime";

// const myWindow: any = window;
// freelogApp.setSelfResourceNameForDev("ZhuC/comic-theme");
// myWindow.freelogApp.onLogin(() => myWindow.location.reload());

freelogApp.onLogin(() => window.location.reload());
const router = createRouter({ history: createWebHistory(), routes });
createApp(App).use(router).use(store).use(lazyPlugin, {}).mount("#app");
store.dispatch("initStoreData");

// if (myWindow.__POWERED_BY_WUJIE__) {
//   let instance: any;
//   myWindow.__WUJIE_MOUNT = () => {
//     const router = createRouter({ history: createWebHistory(), routes });
//     instance = createApp(App).use(router).use(store).use(lazyPlugin, {}).mount("#app");
//     store.dispatch("initStoreData");
//   };
//   myWindow.__WUJIE_UNMOUNT = () => {
//     instance.unmount();
//   };
// } else {
//   const router = createRouter({ history: createWebHistory(), routes });
//   createApp(App).use(router).use(store).use(lazyPlugin, {}).mount("#app");
//   store.dispatch("initStoreData");
// }

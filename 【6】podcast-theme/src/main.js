import "./public-path";
import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App.vue";
import routes from "./router";
import store from "./store";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import vView from "vue-view-lazy";
import * as filters from "@/utils/filter";
import { freelogApp, initFreelogApp } from "freelog-runtime";
import "@/directives";
import mapRoutes from "@/utils/map-routes"
import { scrollIntoView, sleep } from "@/utils/common"

Vue.use(vView);
Vue.use(ElementUI);

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]);
});

Vue.config.productionTip = false;

/** 获取原型对象上的 push 函数 */
const originalPush = VueRouter.prototype.push;
// 修改原型对象中的 push 方法
VueRouter.prototype.push = function push(location) {
  // 不 push 到当前路由
  return originalPush.call(this, location).catch(err => err);
};

/** 重写 router 对象中的 push */
VueRouter.prototype.myPush = location => {
  const { locationHistory } = store.state;
  const str = JSON.stringify(location);
  // push 到当前路由，禁止
  if (str === locationHistory[locationHistory.length - 1]) return;

  router.push(location);
  locationHistory.push(str);
  store.commit("setData", { key: "locationHistory", value: locationHistory });
  store.commit("setData", { key: "routerMode", value: 1 });
};

// 监听浏览器返回
window.addEventListener(
  "popstate",
  () => {
    const { locationHistory } = store.state;
    locationHistory.pop();
    store.commit("setData", { key: "locationHistory", value: locationHistory });
    store.commit("setData", { key: "routerMode", value: 2 });
    console.log('popstate', locationHistory, store.state.routerMode);
  },
  true
);

let app = null;
let router = null;

window.mount = () => {
  initFreelogApp();
  /* 路由映射 */
  freelogApp.mapShareUrl(mapRoutes)
  /* 修复ios的safari浏览器, 软键盘将页面顶到安全区域外的问题
   * 方式一: scrollIntoView
   * 方式二: v-if重渲染全部页面
  */
  // 登录成功后, 使用方式二
  // 关闭登录框, 使用方式一
  freelogApp.onLogin(async () => {
    if (store.state.isIOS) {
      store.commit('setData', {
        key: 'maskLoading',
        value: true
      })
      await sleep(350)
      store.commit('setData', {
        key: 'maskLoading',
        value: false
      })
    }
    const url = freelogApp.getCurrentUrl()
    location.href = url
  }, () => {
    if (store.state.isIOS) {
      scrollIntoView()
    }
  })
  router = new VueRouter({ base: "/", mode: "history", routes });
  app = new Vue({ router, store, render: h => h(App) }).$mount("#app");
  store.dispatch("initStoreData");
};

window.unmount = () => {
  app.$destroy();
  app.$el.innerHTML = "";
  app = null;
};

if (!window.__MICRO_APP_ENVIRONMENT__) {
  window.mount();
}

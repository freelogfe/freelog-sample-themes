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

Vue.use(vView);
Vue.use(ElementUI);

Object.keys(filters).forEach((key) => {
  Vue.filter(key, filters[key]);
});

Vue.config.productionTip = false;

// 获取原型对象上的 push 函数
const originalPush = VueRouter.prototype.push;
// 修改原型对象中的 push 方法
VueRouter.prototype.push = function push(location) {
  // 不 push 到当前路由
  return originalPush.call(this, location).catch((err) => err);
};

// 重写 router 对象中的 push
VueRouter.prototype.myPush = (location) => {
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
  },
  true
);

window.FREELOG_RESOURCENAME = "ZhuC/podcast-theme";

let router = null;
let instance = null;

function render(props = {}) {
  const { container } = props;
  router = new VueRouter({
    base: "/",
    mode: "history",
    routes,
  });

  instance = new Vue({
    router,
    store,
    render: (h) => h(App),
  }).$mount(container ? container.querySelector("#app") : "#app");

  store.dispatch("initStoreData");
}

if (!window.__POWERED_BY_FREELOG__) {
  render();
}

export async function bootstrap() {
  console.log("[vue] vue app bootstraped");
}

export async function mount(props) {
  console.log("[vue] props from main framework", props);
  render(props);
}

export async function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = "";
  instance = null;
  router = null;
}

import "./public-path";
import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App.vue"
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
window.mount = async () => {
  initFreelogApp();
  
  /* mapShareUrl修改地址后, 路由无动作; 路由去除重定向可观察到现象(part1);
   * 解决方式, 自己使用router.replace一次完成路由导航;
   */
  let id, itemId
  const url = freelogApp.getCurrentUrl()
  const urlArr = url.split('?')
  const vualeArr = urlArr[0].split('.com')
  const tempArr = vualeArr[1].split('/')
  const finalArr = tempArr.filter(ele => ele)
  
  if (["detail", "detail-sub"].includes(finalArr[finalArr.length - 1])) {
    id = finalArr[0]
    if (finalArr.length === 3) {
      itemId = finalArr[1]
    }
  }

  /* 路由映射: mapShareUrl会调用映射函数得到地址, 并异步导航  */
  await freelogApp.mapShareUrl(mapRoutes)
  
  /* 修复ios的safari浏览器, 软键盘将页面顶到安全区域外的问题
   * 方式一: scrollIntoView
   * 方式二: v-if重渲染全部页面
  */
  // 登录成功后, 使用方式二
  // 关闭登录框, 使用方式一
  freelogApp.onLogin(async () => {
    if (store.state.isIOS) {
      store.commit('setData', { key: 'maskLoading', value: true })
      await sleep(350)
      store.commit('setData', { key: 'maskLoading', value: false })
    }
    const url = freelogApp.getCurrentUrl()
    location.href = url
  }, () => {
    if (store.state.isIOS) { scrollIntoView() }
  })

  router = new VueRouter({ base: "/", mode: "history", routes });
  router.beforeEach((to, from, next) => {
    console.log("to, from, next", to, from, next);
    // import()导入时 => from: /; to: /detail
    // import...from...静态导入时 => from: /; to: /home
    next()
  })
  router.afterEach(to => {
    // 将第一个路由记入路由历史
    const { locationHistory } = store.state;
    if (locationHistory.length) return;

    const { path, query } = to;
    locationHistory.push(JSON.stringify({ path, query }));
    store.commit("setData", { key: "locationHistory", value: locationHistory });
    store.commit("setData", { key: "routerMode", value: 1 });
  });

  /* import...from...静态导入时, 分享链接失效; import()导入时, 分享链接可成功打开;
   * import...from...静态导入时: 在main.js中先导入App.vue时, 在mapShareUrl后, 还需要sleep一次, 具体原因未知(目前已在mapShareUrl里sleep了, 在主题中不需要再处理);
   * import()导入时: 分享链接可成功打开; const { default: App } = await import("./App.vue")
   */
  // const { default: App } = await import("./App.vue")
  
  Vue.use(VueRouter)
  app = new Vue({ router, store, render: h => h(App) }).$mount("#app");

  /* mapShareUrl修改地址后, 路由无动作; 路由去除重定向可观察到现象(part2);
   * 解决方式, 自己使用router.replace一次完成路由导航;
   */
  if (["detail", "detail-sub"].includes(finalArr[finalArr.length - 1])) {
    router.replace({
      path: finalArr[finalArr.length - 1],
      query: {
        id,
        itemId
      }
    })
  }
  
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

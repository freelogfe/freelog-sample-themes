import { createRouter, createWebHistory } from "vue-router";
import { useGlobalStore } from "@/store/global";
import type { Router } from "vue-router";

// 定义一个扩展的Router类型以包含myPush方法
interface ExtendedRouter extends Router {
  myPush(location: Record<string, string>): void;
}

// 页面路由
const routes = [
  {
    path: "/",
    redirect: { name: "home" }
  },
  {
    path: "/home",
    name: "home",
    component: () => import("../views/home/index.vue"),
    meta: { keepAlive: true }
  },
  {
    path: "/voice-list",
    name: "voice-list",
    component: () => import("../views/voice-list/index.vue"),
    meta: { keepAlive: true }
  },
  {
    path: "/album-list",
    name: "album-list",
    component: () => import("../views/album-list/index.vue"),
    meta: { keepAlive: true }
  },
  {
    path: "/detail",
    name: "detail",
    component: () => import("../views/detail/index.vue")
  },
  {
    path: "/collection-list",
    name: "collection-list",
    component: () => import("../views/collection/index.vue"),
    meta: { keepAlive: true }
  },
  {
    path: "/signed-list",
    name: "signed-list",
    component: () => import("../views/signed-list/index.vue"),
    meta: { keepAlive: true }
  },
  {
    path: "/search-list",
    name: "search-list",
    component: () => import("../views/search-list/index.vue"),
    meta: { keepAlive: true }
  },
  {
    path: "/:pathMatch(.*)",
    redirect: { name: "home" }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
}) as ExtendedRouter;

/** 获取原型对象上的 push 函数 */
const originalPush = router.push;
// 修改原型对象中的 push 方法
router.push = function (location) {
  return originalPush.call(this, location).catch(err => err);
};

/** 重写 router 对象中的 push */
router.myPush = (location: Record<string, string>) => {
  const store = useGlobalStore();
  const { locationHistory } = store;
  const str = JSON.stringify(location);
  // push 到当前路由，禁止
  if (str === locationHistory[locationHistory.length - 1]) return;

  router.push(location);
  locationHistory.push(str);
  store.setData({ key: "locationHistory", value: locationHistory });
  store.setData({ key: "routerMode", value: 1 });
};

// 监听浏览器返回
window.addEventListener(
  "popstate",
  () => {
    const store = useGlobalStore();
    const { locationHistory } = store;
    locationHistory.pop();
    store.setData({ key: "locationHistory", value: locationHistory });
    store.setData({ key: "routerMode", value: 2 });
  },
  true
);

router.afterEach(to => {
  // 将第一个路由记入路由历史
  const store = useGlobalStore();
  const { locationHistory } = store;
  console.log("%cPINIA数据", "color:green; padding:10px; font-size: 15px", store);

  if (locationHistory.length) return;

  const { path, query } = to;
  locationHistory.push(JSON.stringify({ path, query }));
  store.setData({ key: "locationHistory", value: locationHistory });
  store.setData({ key: "routerMode", value: 1 });
});

export default router;

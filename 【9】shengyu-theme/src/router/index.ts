import { createRouter, createWebHistory } from "vue-router";
import { useGlobalStore } from "@/store/global";
import type { Router } from "vue-router";
import { canonicalDetailLocation } from "@/utils/detail-route";

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
    component: () => import("../views/shengyu/index.vue"),
    meta: { keepAlive: true }
  },
  {
    path: "/voice-list",
    name: "voice-list",
    component: () => import("../views/shengyu/index.vue"),
    meta: { keepAlive: true }
  },
  {
    path: "/album-list",
    name: "album-list",
    component: () => import("../views/shengyu/index.vue"),
    meta: { keepAlive: true }
  },
  {
    path: "/play-list",
    name: "play-list",
    component: () => import("../views/shengyu/index.vue"),
    meta: { keepAlive: true }
  },
  {
    path: "/detail",
    name: "detail",
    component: () => import("../views/shengyu/index.vue")
  },
  {
    path: "/play-detail",
    name: "play-detail",
    redirect: (to: import('vue-router').RouteLocation) => canonicalDetailLocation(to.query, to.hash)
  },
  {
    path: "/collection-list",
    name: "collection-list",
    component: () => import("../views/shengyu/index.vue")
    // meta: { keepAlive: true }
  },
  {
    path: "/signed-list",
    name: "signed-list",
    component: () => import("../views/shengyu/index.vue"),
    meta: { keepAlive: true }
  },
  {
    path: "/search-list",
    name: "search-list",
    component: () => import("../views/shengyu/index.vue")
    // meta: { keepAlive: true }
  },
  { path: "/podcast-list", name: "podcast-list", component: () => import("../views/shengyu/index.vue") },
  {
    path: "/:pathMatch(.*)",
    redirect: { name: "home" }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
}) as ExtendedRouter;

router.beforeEach(to => {
  if (to.path === '/detail' && Object.prototype.hasOwnProperty.call(to.query, 'subID')) {
    return canonicalDetailLocation(to.query, to.hash);
  }
});

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
  // RouterLink and ordinary push navigation do not update locationHistory.
  // Only skip when the destination is the route currently being displayed.
  if (router.resolve(location).fullPath === router.currentRoute.value.fullPath) return;

  router.push(location);
  locationHistory.push(str);
  store.setData({ key: "locationHistory", value: locationHistory });
  store.setData({ key: "routerMode", value: 1 });
};

router.afterEach(() => document.getElementById('app')?.scrollTo({top:0}));
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
  // console.log("%cPINIA数据", "color:green; padding:10px; font-size: 15px", store);

  if (locationHistory.length) return;

  const { path, query } = to;
  locationHistory.push(JSON.stringify({ path, query }));
  store.setData({ key: "locationHistory", value: locationHistory });
  store.setData({ key: "routerMode", value: 1 });
});

export default router;

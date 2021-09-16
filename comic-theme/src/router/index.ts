import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/home.vue"),
  },
  {
    path: "/detail",
    name: "detail",
    component: () => import("../views/detail.vue"),
  },
  {
    path: "/shelf",
    name: "shelf",
    component: () => import("../views/shelf.vue"),
  },
  {
    path: "/reader",
    name: "reader",
    component: () => import("../views/reader.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

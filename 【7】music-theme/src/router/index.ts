import { createRouter, createWebHistory } from "vue-router";

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
    path: "/collection-list",
    name: "collection-list",
    component: () => import("../views/collection/index.vue"),
    meta: { keepAlive: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

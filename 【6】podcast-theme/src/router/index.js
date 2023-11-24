import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: { name: "home" },
  },
  {
    path: "/home",
    name: "home",
    component: () => import("../views/home.vue"),
    meta: { keepAlive: true },
  },
  {
    path: "/voice-list",
    name: "voice-list",
    component: () => import("../views/voice-list.vue"),
    meta: { keepAlive: true },
  },
  {
    path: "/detail",
    name: "detail",
    component: () => import("../views/detail.vue"),
  },
  {
    path: "/signed-list",
    name: "signed-list",
    component: () => import("../views/signed-list.vue"),
    meta: { keepAlive: true },
  },
  {
    path: "/collection-list",
    name: "collection-list",
    component: () => import("../views/collection-list.vue"),
    meta: { keepAlive: true },
  },
  {
    path: "/search-list",
    name: "search-list",
    component: () => import("../views/search-list.vue"),
    meta: { keepAlive: true },
  },
  {
    path: "/:pathMatch(.*)",
    redirect: { name: "home" },
  },
];

export default routes;

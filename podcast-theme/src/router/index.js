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
  },
  {
    path: "/voice-list",
    name: "voice-list",
    component: () => import("../views/voice-list.vue"),
  },
  {
    path: "/voice-detail",
    name: "voice-detail",
    component: () => import("../views/voice-detail.vue"),
  },
  {
    path: "/signed-list",
    name: "signed-list",
    component: () => import("../views/signed-list.vue"),
  },
  {
    path: "/collection-list",
    name: "collection-list",
    component: () => import("../views/collection-list.vue"),
  },
  {
    path: "/search-list",
    name: "search-list",
    component: () => import("../views/search-list.vue"),
  },
];

export default routes;

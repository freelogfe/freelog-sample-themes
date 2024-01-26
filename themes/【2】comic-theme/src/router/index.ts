import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: { name: "home" },
  },
  {
    path: "/:pathMatch(.*)",
    redirect: { name: "home" },
  },
  {
    path: "/home",
    name: "home",
    component: () => import("../views/home.vue"),
  },
  {
    path: "/shelf",
    name: "shelf",
    component: () => import("../views/shelf.vue"),
  },
  {
    path: "/signedList",
    name: "signedList",
    component: () => import("../views/signed-list.vue"),
  },
  {
    path: "/detail",
    name: "detail",
    component: () => import("../views/detail.vue"),
  },
  {
    path: "/reader",
    name: "reader",
    component: () => import("../views/reader.vue"),
  },
];

export default routes;

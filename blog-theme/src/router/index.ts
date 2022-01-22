import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
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
    path: "/content",
    name: "content",
    component: () => import("../views/content.vue"),
  },
  {
    path: "/signedList",
    name: "signedList",
    component: () => import("../views/signed-list.vue"),
  },
];

export default routes;

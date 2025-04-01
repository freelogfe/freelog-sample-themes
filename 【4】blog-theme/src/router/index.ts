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
    path: "/reader",
    name: "reader",
    component: () => import("../views/reader.vue"),
  },
  {
    path: "/signedList",
    name: "signedList",
    component: () => import("../views/signed-list.vue"),
  },
  {
    path: "/search",
    name: "search",
    component: () => import("../views/search.vue"),
  },
];

export default routes;

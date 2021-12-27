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
];

export default routes;

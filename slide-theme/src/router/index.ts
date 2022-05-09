import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: { name: "slide" },
  },
  {
    path: "/slide",
    name: "slide",
    component: () => import("../views/slide.vue"),
  },
];

export default routes;

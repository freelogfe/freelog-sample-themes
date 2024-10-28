import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: { name: "reader" },
  },
  {
    path: "/:pathMatch(.*)",
    redirect: { name: "reader" },
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
];

export default routes;

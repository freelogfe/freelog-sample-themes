import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: { name: "home" }
  },
  {
    path: "/:pathMatch(.*)",
    redirect: { name: "home" }
  },
  {
    path: "/home",
    name: "home",
    component: () => import("../views/home.vue")
  },
  {
    path: "/blog",
    name: "blog",
    component: () => import("../views/blog.vue")
  },
  {
    path: "/column",
    name: "column",
    component: () => import("../views/column.vue")
  },
  {
    path: "/column-detail",
    name: "column-detail",
    component: () => import("../views/column-detail.vue")
  },
  {
    path: "/reader",
    name: "reader",
    component: () => import("../views/reader.vue")
  },
  {
    path: "/signedList",
    name: "signedList",
    component: () => import("../views/signed-list.vue")
  },
  {
    path: "/search",
    name: "search",
    component: () => import("../views/search.vue")
  }
];

export default routes;

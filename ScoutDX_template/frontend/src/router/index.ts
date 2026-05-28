import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import Login from "../views/auth/Login.vue";
import ScoutCreate from "../views/scout/ScoutCreate.vue";
import ScoutDetail from "../views/scout/ScoutDetail.vue";
import ScoutEdit from "../views/scout/ScoutEdit.vue";
import ScoutListSales from "../views/scout/ScoutListSales.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/scout/create",
    name: "scout-create",
    component: ScoutCreate,
  },
  {
    path: "/scout/:id",
    name: "scout-detail",
    component: ScoutDetail,
  },
  {
    path: "/scout/:id/edit",
    name: "scout-edit",
    component: ScoutEdit,
  },
  {
    path: "/scout/list-sales",
    name: "scout-list-sales",
    component: ScoutListSales,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type RouteLocationNormalized,
} from "vue-router";
import Login from "../views/auth/Login.vue";
import ChangePassword from "../views/auth/ChangePassword.vue";
import UserList from "../views/admin/UserList.vue";
import ScoutCreate from "../views/scout/ScoutCreate.vue";
import ScoutDetail from "../views/scout/ScoutDetail.vue";
import ScoutEdit from "../views/scout/ScoutEdit.vue";
import ScoutList from "../views/scout/ScoutList.vue";
import { useLoginStore } from "../store/login.Store";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/scout/list",
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
    meta: { requiresAuth: true },
  },
  {
    path: "/scout/:id",
    name: "scout-detail",
    component: ScoutDetail,
    meta: { requiresAuth: true },
  },
  {
    path: "/scout/:id/edit",
    name: "scout-edit",
    component: ScoutEdit,
    meta: { requiresAuth: true },
  },
  {
    path: "/scout/list",
    name: "scout-list",
    component: ScoutList,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/users",
    name: "user-list",
    component: UserList,
    meta: { requiresAuth: true },
  },
  {
    path: "/auth/change-password",
    name: "change-password",
    component: ChangePassword,
    meta: { requiresAuth: true },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to: RouteLocationNormalized) => {
  const loginStore = useLoginStore();

  if (to.meta.requiresAuth && !loginStore.isLoggedIn) {
    await loginStore.checkSession();
  }

  if (to.path === "/" && loginStore.isLoggedIn) {
    return "/scout/list";
  }

  if (to.path === "/login") {
    if (loginStore.isLoggedIn) {
      await loginStore.logout();
    } else {
      loginStore.user = null;
      loginStore.error = "";
    }
    return true;
  }

  if (to.meta.requiresAuth && !loginStore.isLoggedIn) {
    return "/login";
  }

  return true;
});

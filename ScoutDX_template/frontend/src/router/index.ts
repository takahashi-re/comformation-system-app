import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type RouteLocationNormalized,
} from "vue-router";
import Login from "../views/auth/Login.vue";
import ChangePassword from "../views/auth/ChangePassword.vue";
import UserList from "../views/admin/UserList.vue";
import UserDetail from "../views/admin/UserDetail.vue";
import UserEdit from "../views/admin/UserEdit.vue";
import UserCreate from "../views/admin/UserCreate.vue";
import ScoutCreate from "../views/scout/ScoutCreate.vue";
import ScoutDetail from "../views/scout/ScoutDetail.vue";
import ScoutEdit from "../views/scout/ScoutEdit.vue";
import ScoutList from "../views/scout/ScoutList.vue";
import ApprovalDetail from "../views/approval/ApprovalDetail.vue";
import AIConfig from "../views/setting/AIConfig.vue";
import { useLoginStore } from "../store/login.Store";

const getHomePath = () => "/scout/list";

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
    path: "/review/:id",
    name: "review-detail",
    component: ApprovalDetail,
    meta: { requiresAuth: true, roles: ["approver", "admin"] },
  },
  {
    // AI設定画面（NGワード・最大文字数設定）
    path: "/conditions",
    name: "conditions",
    component: AIConfig,
    meta: { requiresAuth: true, roles: ["approver", "admin"] },
  },
  {
    path: "/admin/users",
    name: "user-list",
    component: UserList,
    meta: { requiresAuth: true, roles: ["admin"] },
  },
  {
    path: "/admin/users/new",
    name: "user-create",
    component: UserCreate,
    meta: { requiresAuth: true, roles: ["admin"] },
  },
  {
    path: "/admin/users/:id",
    name: "user-detail",
    component: UserDetail,
    meta: { requiresAuth: true, roles: ["admin"] },
  },
  {
    path: "/admin/users/:id/edit",
    name: "user-edit",
    component: UserEdit,
    meta: { requiresAuth: true, roles: ["admin"] },
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
    return getHomePath();
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

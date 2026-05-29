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
import { clearLogin, getToken } from "../api/loginApi";

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

router.beforeEach((to: RouteLocationNormalized) => {
  const isLoggedIn = Boolean(getToken());

  if (to.path === "/" && isLoggedIn) {
    return getHomePath();
  }

  if (to.path === "/login") {
    // /login へ来た場合は強制ログアウトするが、遷移自体は許可する
    clearLogin();
    return true;
  }

  if (to.meta.requiresAuth && !isLoggedIn) {
    return "/login";
  }
  return true;
});

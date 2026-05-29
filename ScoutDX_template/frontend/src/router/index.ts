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
import { getToken, getUser } from "../api/loginApi";

type AppRole = "sales" | "approver" | "admin";

const toRole = (positionId: number | null | undefined): AppRole => {
  if (positionId === 3) {
    return "admin";
  }
  if (positionId === 2) {
    return "approver";
  }
  return "sales";
};

const getHomePath = (role: AppRole): string => {
  if (role === "admin") {
    return "/admin/users";
  }
  return "/scout/list";
};

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
  const role = toRole(getUser()?.position_id);

  if (to.path === "/" && isLoggedIn) {
    return getHomePath(role);
  }

  if (to.path === "/login" && isLoggedIn) {
    return getHomePath(role);
  }

  if (to.meta.requiresAuth && !isLoggedIn) {
    return "/login";
  }

  const allowedRoles = to.meta.roles as AppRole[] | undefined;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return getHomePath(role);
  }

  return true;
});

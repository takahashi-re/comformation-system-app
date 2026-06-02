import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type RouteLocationNormalized,
} from "vue-router";
import Login from "../views/auth/Login.vue";
import ChangePassword from "../views/auth/ChangePassword.vue";
import Forbidden from "../views/auth/Forbidden.vue";
import UserList from "../views/admin/UserList.vue";
import UserDetail from "../views/admin/UserDetail.vue";
import UserEdit from "../views/admin/UserEdit.vue";
import UserCreate from "../views/admin/UserCreate.vue";
import ScoutCreate from "../views/scout/ScoutCreate.vue";
import ScoutDetail from "../views/scout/ScoutDetail.vue";
import ScoutEdit from "../views/scout/ScoutEdit.vue";
import ScoutList from "../views/scout/ScoutList.vue";
import ApprovalDetail from "../views/approval/ApprovalDetail.vue";
import Dashboard from "../views/dashboard/Dashboard.vue";
import AIConfig from "../views/setting/AIConfig.vue";
import { useLoginStore } from "../store/login.Store";

const getHomePath = () => "/dashboard";

const DEFAULT_ALLOWED_POSITION_IDS = [1, 2, 3];
//1=営業、2=営業承認者、3 = 管理者

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: getHomePath,
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/forbidden",
    name: "forbidden",
    component: Forbidden,
    meta: { requiresAuth: true },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/scout/create",
    name: "scout-create",
    component: ScoutCreate,
    meta: { requiresAuth: true, allowedPositionIds: [1] },
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
    meta: { requiresAuth: true, allowedPositionIds: [1] },
  },
  {
    path: "/scout/list",
    name: "scout-list",
    component: ScoutList,
    meta: {
      requiresAuth: true,
      // URLごとに許可IDを変えるときはここを書き換える
      // allowedPositionIds: [1, 2],
    },
  },
  {
    path: "/review/:id",
    name: "review-detail",
    component: ApprovalDetail,
    meta: {
      requiresAuth: true,
      roles: ["approver", "admin"],
      allowedPositionIds: [2, 3],
    },
  },
  {
    // AI設定画面（NGワード・最大文字数設定）
    path: "/conditions",
    name: "conditions",
    component: AIConfig,
    meta: {
      requiresAuth: true,
      roles: ["approver", "admin"],
      allowedPositionIds: [2, 3],
    },
  },
  {
    path: "/admin/users",
    name: "user-list",
    component: UserList,
    meta: { requiresAuth: true, roles: ["admin"], allowedPositionIds: [3] },
  },
  {
    path: "/admin/users/new",
    name: "user-create",
    component: UserCreate,
    meta: { requiresAuth: true, roles: ["admin"], allowedPositionIds: [3] },
  },
  {
    path: "/admin/users/:id",
    name: "user-detail",
    component: UserDetail,
    meta: { requiresAuth: true, roles: ["admin"], allowedPositionIds: [3] },
  },
  {
    path: "/admin/users/:id/edit",
    name: "user-edit",
    component: UserEdit,
    meta: { requiresAuth: true, roles: ["admin"], allowedPositionIds: [3] },
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

  const hasValidSession = loginStore.isLoggedIn;
  const userPositionId = loginStore.user?.position_id ?? null;
  const routeAllowedPositionIds =
    (to.meta.allowedPositionIds as number[] | undefined) ??
    DEFAULT_ALLOWED_POSITION_IDS;
  const isAllowedPosition =
    userPositionId !== null && routeAllowedPositionIds.includes(userPositionId);

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

  if (to.meta.requiresAuth && !hasValidSession) {
    loginStore.user = null;
    loginStore.error = "";
    return "/login";
  }

  if (to.meta.requiresAuth && !isAllowedPosition && to.path !== "/forbidden") {
    return {
      path: "/forbidden",
      query: { message: "権限がありません" },
    };
  }
  return true;
});

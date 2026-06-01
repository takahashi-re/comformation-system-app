<template>
  <div class="app-shell">
    <header v-if="showHeader" class="app-header">
      <nav class="app-nav">
        <RouterLink to="/dashboard" class="nav-link">ダッシュボード</RouterLink>
        <RouterLink to="/scout/list" class="nav-link">scout文一覧</RouterLink>
        <RouterLink
          to="/admin/users"
          class="nav-link"
          v-if="userPositionId === 3"
          >従業員一覧</RouterLink
        >
        <span class="user-name">ユーザー名: {{ userName }}</span>
        <RouterLink to="/auth/change-password" class="nav-link"
          >パスワード変更</RouterLink
        >
        <button type="button" class="logout-button" @click="handleLogout">
          ログアウト
        </button>
      </nav>
    </header>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLoginStore } from "./store/login.Store";

const route = useRoute();
const router = useRouter();
const loginStore = useLoginStore();

const showHeader = computed(
  () => route.path !== "/login" && loginStore.isLoggedIn,
);
const userName = computed(
  () => loginStore.user?.name ?? loginStore.user?.employee_id ?? "",
);
const userPositionId = computed(() => loginStore.user?.position_id ?? 0);

onMounted(async () => {
  if (route.path !== "/login") {
    await loginStore.checkSession();
  }
});

const handleLogout = async (): Promise<void> => {
  await loginStore.logout();
  router.push("/login");
};
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f9fafb;
}

.app-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.app-nav {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  padding: 16px 24px;
}

.nav-link {
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
}

.nav-link:hover {
  color: #1f2937;
  background: #f3f4f6;
}

.nav-link.router-link-active {
  color: #1f2937;
  background: #f3f4f6;
  font-weight: 600;
}

.user-name {
  margin-left: auto;
  font-weight: 500;
  font-size: 14px;
  color: #6b7280;
  padding: 8px 12px;
  letter-spacing: -0.01em;
}

.logout-button {
  min-width: 100px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
  background: #ffffff;
  color: #374151;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.logout-button:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #1f2937;
}

.logout-button:active {
  background: #f3f4f6;
}

.app-main {
  min-height: calc(100vh - 64px);
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .app-nav {
    padding: 12px 16px;
    gap: 6px;
  }

  .nav-link {
    font-size: 13px;
    padding: 6px 12px;
  }

  .user-name {
    font-size: 13px;
    padding: 6px 8px;
    margin-left: 0;
    width: 100%;
    order: -1;
    text-align: right;
  }

  .logout-button {
    font-size: 13px;
    padding: 6px 16px;
    min-width: 80px;
  }
}

@media (max-width: 480px) {
  .app-nav {
    padding: 10px 12px;
  }

  .nav-link {
    font-size: 12px;
    padding: 5px 10px;
  }

  .user-name {
    font-size: 12px;
  }

  .logout-button {
    font-size: 12px;
    padding: 5px 14px;
  }
}
</style>

<template>
  <div class="app-shell">
    <header v-if="showHeader" class="app-header">
      <nav class="app-nav">
        <RouterLink to="/scout/list" class="nav-link">scout文一覧</RouterLink>
        <RouterLink to="/admin/users" class="nav-link">従業員一覧</RouterLink>
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
  background: #f5f7fb;
}

.app-header {
  background: #1f3c88;
  color: #fff;
  padding: 12px 20px;
}

.app-nav {
  display: flex;
  gap: 14px;
  align-items: center;
  flex-wrap: wrap;
}

.nav-link {
  color: #fff;
  text-decoration: none;
  font-weight: 600;
}

.nav-link.router-link-active {
  text-decoration: underline;
}

.user-name {
  margin-left: auto;
  font-weight: 600;
}

.logout-button {
  border: 1px solid #fff;
  background: transparent;
  color: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.app-main {
  padding: 16px;
}
</style>

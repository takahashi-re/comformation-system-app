<template>
  <section class="forbidden-wrap">
    <div class="forbidden-card">
      <h1>アクセス拒否</h1>
      <p class="message">{{ message }}</p>
      <RouterLink class="back-link" to="/scout/list">
        スカウト文一覧へ戻る
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const message = computed(() => {
  const raw = route.query.message;
  return typeof raw === "string" && raw.trim().length > 0
    ? raw
    : "権限がありません";
});
</script>

<style scoped>
.forbidden-wrap {
  min-height: 60vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.forbidden-card {
  width: min(560px, 100%);
  border: 1px solid #d6dbe3;
  border-radius: 12px;
  background: #ffffff;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

h1 {
  margin: 0 0 12px;
  color: #b42318;
  font-size: 1.4rem;
}

.message {
  margin: 0 0 16px;
  color: #2b3a58;
}

.back-link {
  display: inline-block;
  text-decoration: none;
  color: #ffffff;
  background: #1f3c88;
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 700;
}
</style>

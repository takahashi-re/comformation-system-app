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
  min-height: calc(100vh - 120px);
  display: grid;
  place-items: center;
  padding: 48px 24px;
  background: #f9fafb;
}

.forbidden-card {
  width: min(560px, 100%);
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  padding: 48px 40px;
  box-shadow: 0 4px 6px 0 rgb(0 0 0 / 0.1);
  text-align: center;
}

h1 {
  margin: 0 0 16px;
  color: #dc2626;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.message {
  margin: 0 0 32px;
  color: #4b5563;
  font-size: 15px;
  line-height: 1.6;
}

.back-link {
  display: inline-block;
  min-width: 180px;
  text-decoration: none;
  color: #ffffff;
  background: #374151;
  padding: 12px 28px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.01em;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.08);
}

.back-link:hover {
  background: #1f2937;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.15);
  transform: translateY(-1px);
}

.back-link:active {
  background: #111827;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .forbidden-wrap {
    padding: 32px 16px;
    min-height: calc(100vh - 100px);
  }

  .forbidden-card {
    padding: 36px 28px;
  }

  h1 {
    font-size: 22px;
    margin-bottom: 14px;
  }

  .message {
    font-size: 14px;
    margin-bottom: 28px;
  }

  .back-link {
    width: 100%;
    padding: 11px 24px;
  }
}

@media (max-width: 480px) {
  .forbidden-wrap {
    padding: 24px 12px;
  }

  .forbidden-card {
    padding: 32px 24px;
  }

  h1 {
    font-size: 20px;
  }

  .message {
    font-size: 13px;
  }
}
</style>

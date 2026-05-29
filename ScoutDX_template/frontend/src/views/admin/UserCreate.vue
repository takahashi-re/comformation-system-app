<template>
  <section class="page">
    <h1>ユーザー新規登録</h1>
    <p>この画面は準備中です。</p>
    <button type="button" @click="goBack">一覧へ戻る</button>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = (): void => {
  router.push({ name: 'user-list' })
}
</script>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #d9dfe8;
  border-radius: 8px;
  padding: 20px;
}
</style>

<template>
	<section class="page">
		<h1>ユーザー編集</h1>
		<p>対象ユーザーID: {{ userId }}</p>
		<p>編集機能は今後の実装予定です。</p>
		<div class="actions">
			<button type="button" @click="goDetail">詳細へ戻る</button>
			<button type="button" @click="goBack">一覧へ戻る</button>
		</div>
	</section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const userId = computed(() => String(route.params.id ?? ''))

const goDetail = (): void => {
	router.push({ name: 'user-detail', params: { id: userId.value } })
}

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

.actions {
	display: flex;
	gap: 10px;
}
</style>

<template>
	<section class="page">
		<h1>ユーザー情報</h1>
		<p v-if="isLoading">読み込み中...</p>
		<p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
		<div v-else class="user-info">
			<p>ユーザーID: {{ user?.userId }}</p>
			<p>氏名: {{ displayName }}</p>
			<p>役職: {{ roleLabel }}</p>
		</div>
		<div class="actions">
			<button type="button" @click="goEdit">編集</button>
			<button type="button" :disabled="isResetting || isLoading" @click="handleResetPassword">
				{{ isResetting ? 'リセット中...' : 'パスワードリセット' }}
			</button>
			<button type="button" class="danger" :disabled="isDeleting || isLoading" @click="handleDelete">
				{{ isDeleting ? '削除中...' : '削除' }}
			</button>
			<button type="button" @click="goBack">一覧へ戻る</button>
		</div>
	</section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { deleteUserById, fetchUserById, resetUserPassword } from '../../api/userApi'
import type { User, UserRole } from '../../type/user'

const route = useRoute()
const router = useRouter()

const userId = computed(() => String(route.params.id ?? ''))
const user = ref<User | null>(null)
const isLoading = ref(false)
const isDeleting = ref(false)
const isResetting = ref(false)
const errorMessage = ref('')

const roleLabels: Record<UserRole, string> = {
	admin: '管理者',
	approver: '営業承認者',
	sales: '営業担当',
}

const isUserRole = (value: unknown): value is UserRole => {
	return value === 'admin' || value === 'approver' || value === 'sales'
}

const displayName = computed(() => user.value?.fullName ?? user.value?.username ?? '-')
const roleLabel = computed(() => {
	if (!user.value) {
		return '-'
	}
	const role = user.value.role as unknown
	if (isUserRole(role)) {
		return roleLabels[role]
	}
	return typeof role === 'string' ? role : '-'
})

const loadUser = async (): Promise<void> => {
	isLoading.value = true
	errorMessage.value = ''
	try {
		user.value = await fetchUserById(userId.value)
	} catch (error) {
		console.error('ユーザー詳細取得エラー:', error)
		errorMessage.value = 'ユーザー情報の取得に失敗しました'
	} finally {
		isLoading.value = false
	}
}

const goEdit = (): void => {
	router.push({ name: 'user-edit', params: { id: userId.value } })
}

const handleDelete = async (): Promise<void> => {
	const confirmed = window.confirm('このユーザーを削除します。よろしいですか？')
	if (!confirmed) {
		return
	}

	isDeleting.value = true
	try {
		await deleteUserById(userId.value)
		window.alert('ユーザーを削除しました')
		router.push({ name: 'user-list' })
	} catch (error) {
		console.error('ユーザー削除エラー:', error)
		window.alert('ユーザーの削除に失敗しました')
	} finally {
		isDeleting.value = false
	}
}

const handleResetPassword = async (): Promise<void> => {
	const confirmed = window.confirm('このユーザーのパスワードをユーザーIDにリセットします。よろしいですか？')
	if (!confirmed) {
		return
	}

	isResetting.value = true
	try {
		await resetUserPassword(userId.value)
		window.alert('パスワードをリセットしました')
	} catch (error) {
		console.error('パスワードリセットエラー:', error)
		window.alert('パスワードのリセットに失敗しました')
	} finally {
		isResetting.value = false
	}
}

const goBack = (): void => {
	router.push({ name: 'user-list' })
}

onMounted(() => {
	void loadUser()
})
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

.user-info {
	margin-bottom: 16px;
}

.error {
	color: #c0392b;
}

.actions {
	display: flex;
	gap: 10px;
}

.danger {
	background: #c0392b;
	border: 1px solid #c0392b;
	color: #fff;
}

.danger:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.actions button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}
</style>

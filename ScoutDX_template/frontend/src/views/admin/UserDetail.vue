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
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px 64px;
}

h1 {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.02em;
  margin: 0 0 32px;
  color: #1f2937;
}

.user-info {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.user-info p {
  font-size: 15px;
  color: #1f2937;
  line-height: 1.7;
  margin: 0 0 16px;
  display: flex;
  align-items: baseline;
}

.user-info p:last-child {
  margin-bottom: 0;
}

.error {
  background: #fee2e2;
  color: #dc2626;
  padding: 16px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 24px;
  border: 1px solid #fecaca;
}

.actions {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
}

.actions button {
  min-width: 140px;
  padding: 11px 24px;
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

.actions button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.08);
}

.actions button:active:not(:disabled) {
  background: #f3f4f6;
}

.actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
  color: #9ca3af;
}

.actions button.danger {
  background: #dc2626;
  border-color: #dc2626;
  color: #ffffff;
}

.actions button.danger:hover:not(:disabled) {
  background: #b91c1c;
  border-color: #b91c1c;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.15);
}

.actions button.danger:active:not(:disabled) {
  background: #991b1b;
}

.actions button.danger:disabled {
  background: #fca5a5;
  border-color: #fca5a5;
  color: #ffffff;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .page {
    padding: 32px 16px 48px;
  }

  h1 {
    font-size: 18px;
    margin-bottom: 24px;
  }

  .user-info {
    padding: 24px 20px;
    margin-bottom: 24px;
  }

  .user-info p {
    font-size: 14px;
    margin-bottom: 14px;
  }

  .actions {
    flex-direction: column;
    gap: 10px;
    padding-top: 20px;
  }

  .actions button {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .page {
    padding: 24px 12px 40px;
  }

  h1 {
    font-size: 16px;
  }

  .user-info {
    padding: 20px 16px;
  }

  .user-info p {
    font-size: 13px;
  }
}
</style>

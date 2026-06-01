<template>
	<section class="page">
		<h1>ユーザー編集</h1>
		<p v-if="isLoading">読み込み中...</p>
		<p v-else-if="errorMessage" class="error">{{ errorMessage }}</p>
		<form v-else class="form" @submit.prevent="handleSave">
			<label class="field">
				<span>ユーザーID</span>
				<input v-model.trim="form.userId" type="text" maxlength="20" />
			</label>
			<label class="field">
				<span>氏名</span>
				<input v-model.trim="form.fullName" type="text" maxlength="100" />
			</label>
			<label class="field">
				<span>役職</span>
				<select v-model="form.role">
					<option value="sales">営業担当</option>
					<option value="approver">営業承認者</option>
					<option value="admin">管理者</option>
				</select>
			</label>
			<p v-if="saveErrorMessage" class="error">{{ saveErrorMessage }}</p>
		</form>
		<div class="actions">
			<button type="button" :disabled="isSaving || isLoading || !!errorMessage" @click="handleSave">
				{{ isSaving ? '保存中...' : '保存' }}
			</button>
			<button type="button" :disabled="isSaving" @click="goDetail">詳細へ戻る</button>
			<button type="button" @click="goBack">一覧へ戻る</button>
		</div>
	</section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchUserById, updateUserById } from '../../api/userApi'
import type { UserRole } from '../../type/user'

const route = useRoute()
const router = useRouter()

const userId = computed(() => String(route.params.id ?? ''))
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const saveErrorMessage = ref('')
const form = reactive({
	userId: '',
	fullName: '',
	role: 'sales' as UserRole,
})

const getStatusCode = (error: unknown): number | undefined => {
	if (typeof error !== 'object' || error === null) {
		return undefined
	}

	const response = (error as { response?: { status?: unknown } }).response
	return typeof response?.status === 'number' ? response.status : undefined
}

const loadUser = async (): Promise<void> => {
	isLoading.value = true
	errorMessage.value = ''
	try {
		const user = await fetchUserById(userId.value)
		form.userId = user.userId
		form.fullName = user.fullName ?? user.username
		form.role = user.role
	} catch (error) {
		console.error('ユーザー詳細取得エラー:', error)
		errorMessage.value = 'ユーザー情報の取得に失敗しました'
	} finally {
		isLoading.value = false
	}
}

const validate = (): boolean => {
	if (!form.userId) {
		saveErrorMessage.value = 'ユーザーIDを入力してください'
		return false
	}

	if (!form.fullName) {
		saveErrorMessage.value = '氏名を入力してください'
		return false
	}

	return true
}

const handleSave = async (): Promise<void> => {
	if (isSaving.value || isLoading.value || errorMessage.value) {
		return
	}

	saveErrorMessage.value = ''
	if (!validate()) {
		return
	}

	isSaving.value = true
	try {
		const updated = await updateUserById(userId.value, {
			userId: form.userId,
			fullName: form.fullName,
			role: form.role,
		})
		window.alert('ユーザー情報を保存しました')
		await router.push({ name: 'user-detail', params: { id: updated.userId } })
	} catch (error) {
		console.error('ユーザー更新エラー:', error)
		if (getStatusCode(error) === 409) {
			saveErrorMessage.value = '指定したユーザーIDは既に使用されています'
			return
		}
		saveErrorMessage.value = 'ユーザー情報の保存に失敗しました'
	} finally {
		isSaving.value = false
	}
}

const goDetail = (): void => {
	router.push({ name: 'user-detail', params: { id: userId.value } })
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

.form {
	display: grid;
	gap: 12px;
	margin-bottom: 16px;
}

.field {
	display: grid;
	gap: 6px;
}

.field input,
.field select {
	height: 38px;
	border: 1px solid #c9d2df;
	border-radius: 6px;
	padding: 0 10px;
}

.error {
	color: #c0392b;
}

.actions {
	display: flex;
	gap: 10px;
}

.actions button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}
</style>

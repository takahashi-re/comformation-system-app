<template>
  <section class="page">
    <h1>ユーザー新規登録</h1>
    <form class="form" @submit.prevent="handleCreate">
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

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <div class="actions">
        <button type="submit" :disabled="isSaving">{{ isSaving ? '登録中...' : '登録' }}</button>
        <button type="button" :disabled="isSaving" @click="goBack">一覧へ戻る</button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createUser } from '../../api/userApi'
import type { UserRole } from '../../type/user'

const router = useRouter()
const isSaving = ref(false)
const errorMessage = ref('')
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

const validate = (): boolean => {
  if (!form.userId) {
    errorMessage.value = 'ユーザーIDを入力してください'
    return false
  }

  if (!form.fullName) {
    errorMessage.value = '氏名を入力してください'
    return false
  }

  return true
}

const handleCreate = async (): Promise<void> => {
  if (isSaving.value) {
    return
  }

  errorMessage.value = ''
  if (!validate()) {
    return
  }

  isSaving.value = true
  try {
    const created = await createUser({
      userId: form.userId,
      fullName: form.fullName,
      role: form.role,
    })

    window.alert('ユーザーを登録しました')
    await router.push({ name: 'user-detail', params: { id: created.userId } })
  } catch (error) {
    console.error('ユーザー作成エラー:', error)
    if (getStatusCode(error) === 409) {
      errorMessage.value = '指定したユーザーIDは既に使用されています'
      return
    }
    errorMessage.value = 'ユーザーの登録に失敗しました'
  } finally {
    isSaving.value = false
  }
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

.form {
  display: grid;
  gap: 12px;
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
  margin: 0;
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

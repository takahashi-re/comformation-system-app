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
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px 64px;
}

h1 {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.02em;
  margin: 0 0 32px;
  color: #1f2937;
}

.form {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  display: grid;
  gap: 24px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  letter-spacing: -0.01em;
}

.field input,
.field select {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #1f2937;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
  box-sizing: border-box;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.field input:hover,
.field select:hover {
  border-color: #9ca3af;
}

.field input:focus,
.field select:focus {
  outline: none;
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
}

.field select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%234b5563' d='M4.427 6.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 6H4.604a.25.25 0 00-.177.427z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}

.error {
  color: #dc2626;
  background: #fee2e2;
  border: 1px solid #fecaca;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  margin: 0;
}

.actions {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
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

.actions button[type="submit"] {
  background: #374151;
  border-color: #374151;
  color: #ffffff;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.08);
}

.actions button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.actions button[type="submit"]:hover:not(:disabled) {
  background: #1f2937;
  border-color: #1f2937;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.15);
}

.actions button:active:not(:disabled) {
  background: #f3f4f6;
}

.actions button[type="submit"]:active:not(:disabled) {
  background: #111827;
}

.actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
  color: #9ca3af;
}

.actions button[type="submit"]:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  color: #ffffff;
}

@media (max-width: 768px) {
  .page {
    padding: 32px 16px 48px;
  }

  h1 {
    font-size: 24px;
    margin-bottom: 24px;
  }

  .form {
    padding: 24px 20px;
    gap: 20px;
  }

  .field input,
  .field select {
    height: 42px;
    font-size: 13px;
  }

  .actions {
    flex-direction: column-reverse;
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
    font-size: 22px;
  }

  .form {
    padding: 20px 16px;
  }

  .field span {
    font-size: 12px;
  }

  .field input,
  .field select {
    height: 40px;
  }
}
</style>

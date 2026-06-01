<template>
  <section class="user-list-page">
    <header class="title-bar">
      <h1>従業員一覧</h1>
      <p>{{ displayText }}</p>
    </header>

    <div class="toolbar">
      <label>
        絞り込み
        <select v-model="filterValue" @change="reloadUsers">
          <option value="">すべて</option>
          <option v-for="option in filterOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>

      <label>
        並び順
        <select v-model="sortValue" @change="reloadUsers">
          <option value="">指定なし</option>
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p v-if="isLoading" class="loading">読み込み中...</p>

    <div v-else class="table-wrapper">
      <table class="user-table">
        <thead>
          <tr>
            <th>社員ID</th>
            <th>ユーザー名</th>
            <th>権限</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.userId">
            <td>{{ user.employeeId }}</td>
            <td>{{ user.username }}</td>
            <td>{{ roleLabels[user.role] ?? user.role }}</td>
            <td>
              <button type="button" @click="handleViewDetail(user.userId)">詳細</button>
              <button type="button" class="edit-button" @click="handleEditUser(user.userId)">編集</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="users.length === 0" class="empty-message">表示できるユーザーがいません</p>
    </div>

    <footer class="actions">
      <button type="button" class="create-button" @click="handleCreateUser">新規登録</button>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchUsers } from '../../api/userApi'
import type { User, UserFilterParams, UserRole } from '../../type/user'

const router = useRouter()

const users = ref<User[]>([])
const totalCount = ref(0)
const displayCount = ref(0)
const filterValue = ref<UserRole | ''>('')
const sortValue = ref<UserFilterParams['sort'] | ''>('')
const isLoading = ref(false)
const errorMessage = ref('')

const filterOptions: ReadonlyArray<{ label: string; value: UserRole }> = [
  { label: '管理者', value: 'admin' },
  { label: '営業承認者', value: 'approver' },
  { label: '営業担当', value: 'sales' },
]

const sortOptions: ReadonlyArray<{
  label: string
  value: NonNullable<UserFilterParams['sort']>
}> = [
  { label: 'ユーザー名昇順', value: 'username_asc' },
  { label: 'ユーザー名降順', value: 'username_desc' },
  { label: '登録日昇順', value: 'created_asc' },
  { label: '登録日降順', value: 'created_desc' },
]

const roleLabels: Record<UserRole, string> = {
  admin: '管理者',
  approver: '営業承認者',
  sales: '営業担当',
}

const displayText = computed(() => `表示人数: ${displayCount.value}/${totalCount.value} 名`)

const reloadUsers = async (): Promise<void> => {
  isLoading.value = true
  errorMessage.value = ''

  const params: UserFilterParams = {}
  if (filterValue.value) {
    params.role = filterValue.value
  }
  if (sortValue.value) {
    params.sort = sortValue.value
  }

  try {
    const response = await fetchUsers(params)
    users.value = response.users
    totalCount.value = response.totalCount
    displayCount.value = response.displayCount
  } catch (error: unknown) {
    console.error('ユーザー一覧取得エラー:', error)
    users.value = []
    totalCount.value = 0
    displayCount.value = 0
    errorMessage.value = 'ユーザー一覧の取得に失敗しました'
  } finally {
    isLoading.value = false
  }
}

const handleViewDetail = (userId: string): void => {
  router.push({ name: 'user-detail', params: { id: userId } })
}

const handleEditUser = (userId: string): void => {
  router.push({ name: 'user-edit', params: { id: userId } })
}

const handleCreateUser = (): void => {
  router.push({ name: 'user-create' })
}

onMounted(() => {
  void reloadUsers()
})
</script>

<style scoped>
.user-list-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 48px 24px 64px;
}

.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 12px;
}

.title-bar h1 {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.02em;
  margin: 0;
  color: #1f2937;
}

.title-bar p {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
}

.toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.toolbar label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  letter-spacing: -0.01em;
}

.toolbar select {
  min-width: 200px;
  height: 40px;
  padding: 0 12px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #1f2937;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%234b5563' d='M4.427 6.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 6H4.604a.25.25 0 00-.177.427z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 36px;
}

.toolbar select:hover {
  border-color: #9ca3af;
}

.toolbar select:focus {
  outline: none;
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
}

.error-message {
  color: #dc2626;
  background: #fee2e2;
  border: 1px solid #fecaca;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  margin: 0 0 24px;
}

.loading {
  margin: 24px 0;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
}

.table-wrapper {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th {
  background: #f9fafb;
  padding: 14px 16px;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  letter-spacing: -0.01em;
}

.user-table td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #1f2937;
  line-height: 1.6;
}

.user-table tbody tr {
  transition: background-color 0.15s ease;
}

.user-table tbody tr:hover {
  background: #f9fafb;
}

.user-table tbody tr:last-child td {
  border-bottom: none;
}

.user-table td:last-child {
  display: flex;
  gap: 8px;
  border-bottom: none;
}

.user-table td button {
  min-width: 70px;
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  border: 1.5px solid #d1d5db;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
  background: #ffffff;
  color: #374151;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.user-table td button:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.user-table td button:active {
  background: #f3f4f6;
}

.edit-button {
  margin-left: 0 !important;
}

.empty-message {
  margin: 0;
  padding: 40px 20px;
  color: #6b7280;
  text-align: center;
  font-size: 14px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.create-button {
  min-width: 140px;
  padding: 11px 24px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  border: 1.5px solid #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
  background: #374151;
  color: #ffffff;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.08);
}

.create-button:hover {
  background: #1f2937;
  border-color: #1f2937;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.15);
}

.create-button:active {
  background: #111827;
}

@media (max-width: 768px) {
  .user-list-page {
    padding: 32px 16px 48px;
  }

  .title-bar {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 24px;
    padding-bottom: 16px;
  }

  .title-bar h1 {
    font-size: 18px;
  }

  .title-bar p {
    font-size: 13px;
  }

  .toolbar {
    flex-direction: column;
    padding: 16px;
  }

  .toolbar label {
    width: 100%;
  }

  .toolbar select {
    min-width: 0;
    width: 100%;
  }

  .user-table {
    font-size: 13px;
  }

  .user-table th {
    padding: 12px;
    font-size: 12px;
  }

  .user-table td {
    padding: 12px;
    font-size: 13px;
  }

  .user-table td:last-child {
    flex-direction: column;
    gap: 6px;
  }

  .user-table td button {
    width: 100%;
  }

  .actions {
    margin-top: 24px;
    padding-top: 20px;
  }

  .create-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .user-list-page {
    padding: 24px 12px 40px;
  }

  .title-bar h1 {
    font-size: 16px;
  }

  .user-table {
    font-size: 12px;
  }

  .user-table th,
  .user-table td {
    padding: 10px;
  }
}
</style>
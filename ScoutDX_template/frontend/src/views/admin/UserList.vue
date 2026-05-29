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
  max-width: 1100px;
  margin: 0 auto;
}

.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.toolbar label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar select {
  min-width: 180px;
  padding: 6px 8px;
}

.error-message {
  color: #c0392b;
  margin: 0 0 12px;
}

.loading {
  margin: 16px 0;
}

.table-wrapper {
  background: #ffffff;
  border: 1px solid #d9dfe8;
  border-radius: 8px;
  overflow: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  border-bottom: 1px solid #eef1f5;
  text-align: left;
  padding: 10px 12px;
}

.edit-button {
  margin-left: 8px;
}

.empty-message {
  margin: 0;
  padding: 16px;
  color: #6b7785;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.create-button {
  background: #1f3c88;
  color: #ffffff;
  border: 0;
  border-radius: 6px;
  padding: 10px 16px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .title-bar {
    display: block;
  }

  .title-bar p {
    margin-top: 6px;
  }

  .toolbar {
    display: block;
  }

  .toolbar label {
    margin-bottom: 10px;
  }
}
</style>

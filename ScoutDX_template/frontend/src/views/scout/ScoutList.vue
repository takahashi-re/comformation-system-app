<template>
  <div class="page">

    <!-- タイトル -->
    <h1>スカウト文一覧（営業担当）</h1>

    <div class="main">

      <!-- 左：一覧 -->
      <div class="list-area">
        <h3>スカウト文一覧（{{ scoutList.length }}件）</h3>

        <table>
          <thead>
            <tr>
              <th>内容</th>
              <th>操作</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="item in scoutList" :key="item.id">
              <td>{{ item.text }}</td>
              <td>
                <button @click="goDetail(item.id)">詳細</button>
                <button @click="goEdit(item.id)">編集</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 右：フィルタ -->
      <div class="filter-area">
        <h3>filter選択</h3>
        <input v-model="filters.keyword" placeholder="キーワード" />

        <h3>表示内容選択</h3>
        <select v-model="filters.status">
          <option value="">すべて</option>
          <option value="通常">通常</option>
          <option value="差し戻し">差し戻し</option>
          <option value="承認済み">承認済み</option>
        </select>

        <button @click="search">検索</button>
      </div>

    </div>

    <!-- 下：ボタン -->
    <div class="footer">
      <button @click="goCreate">新規作成</button>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'

const scoutList = ref([
  { id: 1, text: 'スカウト文①' },
  { id: 2, text: 'スカウト文②' },
  { id: 3, text: 'スカウト文③' }
])

const filters = ref({
  keyword: '',
  status: ''
})

const search = () => {
  console.log('検索実行', filters.value)
}

const goDetail = (id) => {
  console.log('詳細', id)
}

const goEdit = (id) => {
  console.log('編集', id)
}

const goCreate = () => {
  console.log('新規作成')
}
</script>

<style scoped>
.page {
  padding: 20px;
}

.main {
  display: flex;
  gap: 20px;
}

/* 左 */
.list-area {
  flex: 1;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ccc;
  padding: 8px;
}

/* 右 */
.filter-area {
  width: 250px;
  border: 1px solid #ccc;
  padding: 10px;
}

/* 下 */
.footer {
  margin-top: 20px;
}
</style>
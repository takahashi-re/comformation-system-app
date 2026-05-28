<template>
  <div class="container">
    <h1 class="title">スカウト文一覧</h1>

    <div class="main">
      <!-- 左側：一覧 -->
      <div class="list-area">
        <h3>スカウト文一覧（表示件数：{{ store.scouts.length }}件）</h3>

        <table>
          <thead>
            <tr>
              <th>概要</th>
              <th>操作</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="item in store.scouts"
              :key="item.id"
              :class="getRowClass(item.status)"
            >
              <td>
                スカウト文（{{ item.creator }}）
                タイトル：{{ item.title }}
                ステータス：{{ item.status }}
              </td>

              <td>
                <button @click="detail(item)">詳細</button>
                <button v-if="canEdit(item.status)">編集</button>
              </td>
            </tr>
          </tbody>
        </table>

        <button class="create-btn" @click="add">
          新規作成
        </button>
      </div>

      <!-- 右側：フィルタ -->
      <div class="filter-area">
        <h3>filter選択</h3>
        <p>（フィルター条件を選択）</p>

        <h3>表示内容選択</h3>
        <p>（表示内容を選択）</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue"
import { useScoutStore } from "../../store/scoutListStore"

const store = useScoutStore()

onMounted(() => {
  store.fetchList()
})

const add = () => {
  store.addScout()
}

const detail = (item) => {
  console.log("詳細", item)
}

// 編集できる条件
const canEdit = (status) => {
  return status === "差戻し"
}

// 行ごとの色
const getRowClass = (status) => {
  if (status === "差戻し") return "warn"
  if (status === "承認済") return "success"
  return ""
}
</script>

<style scoped>
.container {
  padding: 20px;
  font-family: Arial;
}

.title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
}

.main {
  display: flex;
  gap: 20px;
}

/* 左 */
.list-area {
  flex: 3;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #3b6ea5;
  color: white;
  padding: 8px;
}

td {
  border: 1px solid #ccc;
  padding: 8px;
}

/* 行カラー */
.warn {
  background: #fff3cd;
}

.success {
  background: #d4edda;
}

/* 右 */
.filter-area {
  flex: 1;
  border: 1px solid #ccc;
  padding: 10px;
}

/* ボタン */
button {
  margin-right: 5px;
}

.create-btn {
  margin-top: 10px;
  padding: 10px;
  background: #3b6ea5;
  color: white;
}
</style>

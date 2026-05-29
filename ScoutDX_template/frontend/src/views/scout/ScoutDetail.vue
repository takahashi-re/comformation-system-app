<template>

  <div class="detail-container">
    <h2>スカウト文詳細</h2>
  

    <!-- 基本情報 -->
    <div class="table">
  <div class="row">
    <div class="label">作成者</div>
    <div class="value">{{ detail.creator }}</div>
  </div>

  <div class="row">
    <div class="label">宛先候補</div>
    <div class="value">{{ detail.candidate }}</div>
  </div>

  <div class="row">
    <div class="label">求人情報</div>
    <div class="value">{{ detail.jobInfo }}</div>
  </div>

  <div class="row">
    <div class="label">作成日時</div>
    <div class="value">{{ detail.createdAt }}</div>
  </div>

  <div class="row">
    <div class="label">ステータス</div>
    <div class="value">{{ detail.status }}</div>
  </div>

  <div class="row">
    <div class="label">承認者・差戻し者</div>
    <div class="value">{{ detail.reviewer }}</div>
  </div>
</div>
    <div class="bottom">
  <div class="box">
    <div class="box-title">スカウト文本文</div>
    <div class="box-body">
      {{ detail.body }}
    </div>
  </div>

  <div class="box">
    <div class="box-title">差戻しコメント</div>
    <div class="box-body">
      {{ detail.comment }}
    </div>
  </div>
</div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const detail = ref({
  creator: '',
  candidate: '',
  createdAt: '',
  status: '',
  jobInfo: '',
  body: '',
  reviewer: '',
  comment: ''
})

onMounted(async () => {
  const id = route.params.id

  try {
    const res = await fetch(`/api/scout/${id}`)
    const data = await res.json()

    detail.value = {
      creator: data.creator,
      candidate: data.candidate,
      createdAt: data.createdAt,
      status: data.status,
      jobInfo: data.jobInfo,
      body: data.body,
      reviewer: data.reviewer,
      comment: data.comment
    }
  } catch (e) {
    console.error('データ取得エラー', e)
  }
})
</script>

<style scoped>
.detail-container {
  padding: 16px;
  background: #fff;
}

/* タイトルバー */
h2 {
  background: #2f6da3;
  color: white;
  padding: 10px;
  margin: 0;
}

/* テーブル風 */
.table {
  border: 1px solid #999;
}

/* 行 */
.row {
  display: grid;
  grid-template-columns: 200px 1fr;
  border-bottom: 1px solid #999;
}

/* 左ラベル */
.label {
  background: #c7d4e5;
  padding: 8px;
  border-right: 1px solid #999;
  font-weight: bold;
}

/* 右値 */
.value {
  padding: 8px;
  background: #fff;
}

/* 下の2カラム */
.bottom {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 10px;
  margin-top: 16px;
}

/* ボックス */
.box {
  border: 1px solid #999;
  background: #fff;
}

/* ボックスタイトル */
.box-title {
  background: #2f6da3;
  color: white;
  padding: 6px;
  font-weight: bold;
}

/* ボディ */
.box-body {
  padding: 10px;
  background: #fff;
  min-height: 120px;
  white-space: pre-wrap;
}
</style>
<!-- ScoutResubmit.vue -->
<template>
  <div class="container">
    <!-- 差戻しコメント -->
    <div class="section">
      <h3>差戻しコメント</h3>
      <div class="comment-box">
        {{ comment || 'コメントはありません' }}
      </div>
    </div>

    <!-- スカウト文入力 -->
    <div class="section">
      <h3>スカウト文入力</h3>
      <textarea
        v-model="text"
        class="textarea"
        placeholder="スカウト文を入力してください">
      </textarea>
    </div>

    <!-- ボタン -->
    <div class="actions">
      <button class="btn save" @click="onSave">
        保存
      </button>

      <button class="btn submit" @click="onSubmit">
        申請
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// ダミーデータ（APIから取得する想定）
const comment = ref('文章が具体的でないため差戻しします。')
const text = ref('')

// 保存処理
const onSave = () => {
  console.log('保存:', text.value)
}

// 申請処理
const onSubmit = () => {
  if (!text.value) {
    alert('スカウト文を入力してください')
    return
  }
  console.log('申請:', text.value)
}
</script>

<style scoped>
.container {
  padding: 20px;
}

.section {
  margin-bottom: 20px;
}

.comment-box {
  padding: 10px;
  background: #f5f5f5;
  border: 1px solid #ccc;
}

.textarea {
  width: 100%;
  height: 200px;
  padding: 10px;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  cursor: pointer;
}

.save {
  background-color: #ccc;
}

.submit {
  background-color: #007bff;
  color: white;
}
</style>

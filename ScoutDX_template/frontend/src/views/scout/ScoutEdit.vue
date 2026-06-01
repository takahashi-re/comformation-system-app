<!-- ScoutResubmit.vue -->
<template>
  
<!-- メイン -->
  <div class="main">

<!-- 左 -->
    <div class="left">
      <div class="box-title">スカウト文入力欄</div>
      <div class="box-content">
        <textarea
          v-model="scout.body"
          class="textarea"
          placeholder="（スカウト文を入力・編集）"
        ></textarea>
      </div>
    </div>

<!-- 右 -->
    <div class="right">
      <div class="box-title">差戻しコメント</div>
      <div class="box-content">
        <div class="comment-box" v-if="latestRejectComment">
          {{ latestRejectComment }}
        </div>
        <div class="comment-box" v-else>差戻しコメントはありません</div>
      </div>
      <div class="actions">
      <button class="btn save" @click="saveDraft">保存</button>
      <button class="btn submit" @click="submit">申請</button>
    </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { fetchScoutDetail, updateScout } from "../../api/scoutApi";

const route = useRoute();
const router = useRouter();
const scoutId = route.params.id;


// state
const scout = ref({
  id: null,
  body: ''
})

const latestRejectComment = ref(null)
const loading = ref(true)


// 初期表示（DBから取得）
onMounted(async () => {
  loading.value = true

  try {
    const res = await fetchScoutDetail(scoutId)

    // 最新スカウト文
    scout.value = res.scout

    // 最新差戻しコメント
    latestRejectComment.value = res.latestRejectComment

    // ここでテキストエリアに反映
    scout.value.body = res.scout.body;

  } finally {
    loading.value = false

 }
})


/**
 * 保存（下書き保存）
 * → status: DRAFT
 */
const saveDraft = async () => {
  await updateScout({
    id: scout.value.id,
    body: scout.value.body,
    status: 'DRAFT'
  })

  alert('保存しました')

  // 一覧へ戻る（図の最後）
  router.push('/scout/list')
}


/**
 * 申請
 * → バリデーション → OKなら承認待ち
 */
const submit = async () => {
  // バリデーションチェック（図の分岐）
  if (!scout.value.body || scout.value.body.trim() === '') {
    alert('スカウト文を入力してください')
    return
  }
  //NGワード、文字数チェック実装などもここで行う。フロントでやるか、バックでやるか？？？

await updateScout({
    id: scout.value.id,
    body: scout.value.body,
    status: 'PENDING_APPROVER' // 承認者承認待ち
  })

  alert('申請しました')

  
 // 一覧へ戻る（図の最後）
  router.push('/scout/list')
}

</script>


<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 48px 24px 64px;
}

/* メイン左右 */
.main {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* 左側：スカウト入力 */
.left {
  flex: 2;
  min-width: 0;
}

/* 右側：コメント */
.right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* タイトルバー */
.box-title {
  background: #475569;
  color: white;
  padding: 12px 20px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.01em;
  border-radius: 8px 8px 0 0;
}

/* 中身 */
.box-content {
  border: 1px solid #cbd5e1;
  border-top: none;
  background: #ffffff;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

/* テキストエリア（大きく） */
.textarea {
  width: 100%;
  min-height: 500px;
  border: none;
  resize: vertical;
  padding: 20px;
  background: #ffffff;
  box-sizing: border-box;
  font-size: 15px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.7;
  color: #1f2937;
  transition: background-color 0.2s ease;
}

.textarea:focus {
  outline: none;
  background: #f9fafb;
}

.textarea::placeholder {
  color: #9ca3af;
}

/* コメントボックス */
.comment-box {
  min-height: 500px;
  background: #f9fafb;
  padding: 20px;
  font-size: 15px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.7;
  color: #4b5563;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ボタンエリア */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

/* ボタン共通 */
.btn {
  min-width: 140px;
  padding: 11px 32px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
}

/* 保存ボタン */
.save {
  background: #ffffff;
  color: #374151;
  border: 1.5px solid #d1d5db;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.save:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.08);
}

.save:active {
  background: #f3f4f6;
}

/* 申請ボタン */
.submit {
  background: #1f2937;
  color: white;
  border: 1.5px solid #1f2937;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.1);
}

.submit:hover {
  background: #374151;
  border-color: #374151;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.15);
}

.submit:active {
  background: #111827;
}

/* レスポンシブ対応 */
@media (max-width: 1024px) {
  .main {
    flex-direction: column;
  }

  .left,
  .right {
    flex: 1;
    width: 100%;
  }

  .textarea,
  .comment-box {
    min-height: 350px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 32px 16px 48px;
  }

  .main {
    gap: 20px;
  }

  .box-title {
    padding: 10px 16px;
    font-size: 13px;
  }

  .textarea,
  .comment-box {
    padding: 16px;
    font-size: 14px;
    min-height: 300px;
  }

  .actions {
    flex-direction: column-reverse;
    gap: 12px;
    margin-top: 24px;
    padding-top: 20px;
  }

  .btn {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 24px 12px 40px;
  }

  .box-title {
    font-size: 13px;
    padding: 8px 14px;
  }

  .textarea,
  .comment-box {
    font-size: 13px;
    padding: 14px;
  }
}
</style>
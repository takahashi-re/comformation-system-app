<!-- ScoutResubmit.vue -->
<template>
  <div class="container">
    <!-- 差戻しコメント -->
    <div class="section">
      <h3>差戻しコメント</h3>
      <div class="comment-box">
        {{ latestRejectComment || "コメントはありません" }}
      </div>
    </div>
    <!-- スカウト文入力 -->
    <div class="section">
      <h3>スカウト文入力</h3>
      <textarea
        v-model="text"
        class="textarea"
        placeholder="スカウト文を入力してください"
      >
      </textarea>
    </div>
    <!-- ボタン -->
    <div class="actions">
      <button class="btn save" @click="saveDraft">保存</button>
      <button class="btn submit" @click="submit">申請</button>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
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
    text.value = res.scout.body;

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
  router.push('/scouts')
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

await updateScout({
    id: scout.value.id,
    body: scout.value.body,
    status: 'PENDING_APPROVER' // 承認者承認待ち
  })

  alert('申請しました')

  
 // 一覧へ戻る（図の最後）
  router.push('/scouts')
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

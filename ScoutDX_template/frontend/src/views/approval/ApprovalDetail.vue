<template>
  <div class="container">

    <h2>スカウト文承認・差戻し</h2>
    <div class="main">
      <!-- 左 -->
      <div class="left">
        <!-- スカウト文 -->
        <div class="box">
          <div class="title">スカウト文内容表示</div>
          <div class="content large">
            {{ scout.body }}
          </div>
        </div>

        <div class="bottom-row">
          <!-- 求人 -->
          <div class="box">
            <div class="title">求人内容表示</div>
            <div class="content">
              {{ scout.job }}
            </div>
          </div>

          <!-- 履歴 -->
          <div class="box">
            <div class="title">コメント履歴</div>
            <div class="content">
              <div v-for="(c, i) in history" :key="i">
                {{ c }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右 -->
      <div class="right">
        <div class="box">
          <div class="title">コメント</div>
          <textarea v-model="comment" placeholder="コメントを入力"></textarea>
        </div>

        <div class="check-area">
          <label>
            <input type="checkbox" v-model="reasons.integrity" />
            人・事実との整合性がない
          </label>
          <label>
            <input type="checkbox" v-model="reasons.accuracy" />
            表現が不正確・不適切 
          </label>
          <label>
            <input type="checkbox" v-model="reasons.structure" />
            情報の過不足・文章構造 
          </label>
          <label>
            <input type="checkbox" v-model="reasons.expression" />
            表現リスク（誇張・断定・誤認）
          </label>
          <label>
            <input type="checkbox" v-model="reasons.claim" />
            クレームリスク・情報不足による誤認リスク
          </label>
          <label>
            <input type="checkbox" v-model="reasons.typo" />
            誤字脱字 
          </label>
        </div>

        <div class="btns">
          <button class="approve" @click="approve">承認</button>
          <button class="reject" @click="reject">差戻し</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchScoutDetail, updateScout, approveScout } from '../../api/scoutApi'

const route = useRoute()
const router = useRouter()

const id = route.params.id

const scout = ref({
  body: '',
  job: ''
})

const history = ref([])
const comment = ref('')

const reasons = ref({
  integrity: false,
  accuracy: false,
  structure: false,
  expression: false,
  claim: false,
  typo: false
})

/* 初期表示（DB取得） */
onMounted(async () => {
  try {
    const res = await fetch(`/api/scout/${id}`)
    const data = await res.json()

    scout.value.body = data.body
    scout.value.job = data.job
    history.value = data.history || []
  } catch (e) {
    console.error('取得エラー', e)
  }
})


/* 承認 */ //承認者が営業承認者か、管理者かで、ステータス変更が変わる。
const approve = async () => {
  const approverEmployeeId =
    JSON.parse(localStorage.getItem('user') || '{}')?.employee_id || ''

  if (!approverEmployeeId) {
    alert('承認者IDが取得できません')
    return
  }

  const reasonKeys = Object.entries(reasons.value)
    .filter(([, checked]) => checked)
    .map(([key]) => key)

  try {
    await approveScout({
      id: String(id),
      approverEmployeeId,
      comment: comment.value.trim(),
      reasonKeys
    })

    alert('承認しました')
    router.push('/scout/list')
  } catch (e) {
    console.error('承認エラー', e)
    alert('承認に失敗しました')
  }
}

/* 差戻し */
const reject = async () => {
  if (!comment.value) {
    alert('コメントを入力してください')
    return
  }

  await fetch(`/api/scout/${id}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      comment: comment.value,
      reasons: reasons.value
    })
  })

  alert('差戻しました')

  // 一覧へ戻る（図の最後）
  router.push('/scout/list')
}
</script>

<style scoped>
.container {
  background:  #f5f7fb;
  padding: 0px 16px 8px 16px;
}



/* メイン */
.main {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

/* 左右 */
.left {
  flex: 2;
}

.right {
  flex: 1;
}

/* 共通BOX */
.box {
  border: 1px solid #999;
  background: white;
  margin-bottom: 12px;
}

.title {
  background: #2f6da3;
  color: white;
  padding: 6px;
}

.content {
  padding: 10px;
  background: #fff;
  min-height: 120px;
}

.large {
  min-height: 220px;
}

/* 下2列 */
.bottom-row {
  display: flex;
  gap: 10px;
align-items: stretch;
}

.bottom-row .box {
flex: 1;
min-width: 320px;
}

.bottom-row .content {
min-height: 220px;
}


/* コメント */
/* コメント */
textarea {
  display: block;
  width: 100%;          /* 95% -> 100% */
  height: 240px;
  border: none;
  padding: 10px;
  resize: none;
  box-sizing: border-box;
  background: #fff;  /* 任意: content系と揃える */
}

.right .box {
  overflow: hidden;     /* はみ出し対策 */
}

/* チェック */
.check-area {
  margin: 10px 0;
  display: flex;
  flex-direction: column; /* 縦並び */
  gap: 8px;
  align-items: flex-start;
}

.check-area label {
  display: flex;
  align-items: center;
  gap: 8px;
  writing-mode: horizontal-tb; /* 文字を横書きに固定 */
}

/* ボタン */
.btns {
  display: flex;
  justify-content: flex-end;
  gap: 24px;         /* ボタン間の隙間を広げる */
  margin-top: 32px;  /* ボタン上に余白を追加して下に下げる */
}

.approve,
.reject {
  font-size: 1.2rem;     /* 文字を大きく */
  padding: 16px 40px;    /* ボタン自体を大きく */
  border-radius: 6px;    /* 角丸もお好みで */
}

.approve {
  background: #2f6da3;
  color: white;
  border: 2px solid #020507;
}

.reject {
  background: #d90000;
  color: white;
  border: 2px solid #060202;
}
</style>



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
              <div><strong>企業名:</strong> {{ jobInfo.companyName || '未設定' }}</div>
              <div><strong>求人タイトル:</strong> {{ jobInfo.jobTitle || '未設定' }}</div>
              <div><strong>仕事内容:</strong> {{ jobInfo.jobDescription || '未設定' }}</div>
              <div><strong>必要スキル:</strong> {{ jobInfo.requiredSkills || '未設定' }}</div>
              <div><strong>魅力:</strong> {{ jobInfo.jobAppeal || '未設定' }}</div>
              <div><strong>勤務地:</strong> {{ jobInfo.workLocation || '未設定' }}</div>
              <div>
                <strong>想定年収:</strong>
                {{ formatSalary(jobInfo.minSalary, jobInfo.maxSalary) }}
              </div>
            </div>
          </div>

          <!-- 履歴 -->
          <div class="box">
            <div class="title">コメント履歴</div>
            <div class="content">
              <div v-if="history.length === 0">コメント履歴はありません</div>
              <div v-for="item in history" :key="item.historyId" class="history-item">
                <div class="history-meta">
                  {{ item.returnedByEmployeeName || item.returnedByEmployeeId || '不明' }} / {{ formatDate(item.returnedAt) }}
                </div>
                <div>{{ item.returnComment || '（コメントなし）' }}</div>
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
          <div v-if="isAdminReviewer" class="reapply-target">
            <label for="reapplyTarget"><strong>差戻し後の再申請先</strong></label>
            <select id="reapplyTarget" v-model="reapplyTarget">
              <option value="">選択してください</option>
              <option value="APPROVER">営業承認者</option>
              <option value="ADMIN">管理者</option>
            </select>
          </div>
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
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchApprovalDetail, approveScout, rejectScout } from '../../api/scoutApi'
import { getMeApi } from '../../api/loginApi'

const route = useRoute()
const router = useRouter()

const id = route.params.id

const scout = ref({
  body: ''
})

const jobInfo = ref({
  jobPostingId: null,
  companyName: '',
  jobTitle: '',
  jobDescription: '',
  minSalary: null,
  maxSalary: null,
  requiredSkills: '',
  jobAppeal: '',
  workLocation: ''
})

const history = ref([])
const comment = ref('')
const reapplyTarget = ref('')
const currentUser = ref(null)

const reasons = ref({
  integrity: false,
  accuracy: false,
  structure: false,
  expression: false,
  claim: false,
  typo: false
})

const readCurrentUser = () => currentUser.value || {}
const currentUserPositionId = computed(() => Number(readCurrentUser()?.position_id ?? 0))
const isAdminReviewer = computed(() => currentUserPositionId.value === 3)

const ensureCurrentUser = async () => {
  if (currentUser.value) {
    return currentUser.value
  }

  try {
    currentUser.value = await getMeApi()
  } catch (e) {
    console.error('ユーザー取得エラー', e)
    currentUser.value = null
  }

  return currentUser.value
}

/* 初期表示（DB取得） */
onMounted(async () => {
  try {
    const [data] = await Promise.all([
      fetchApprovalDetail(String(id)),
      ensureCurrentUser(),
    ])

    scout.value.body = data.scoutBody
    jobInfo.value = data.jobInfo
    history.value = data.commentHistories || []
  } catch (e) {
    console.error('取得エラー', e)
  }
})

const formatDate = (value) => {
  if (!value) {
    return '日時不明'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '日時不明'
  }

  return date.toLocaleString('ja-JP')
}

const formatSalary = (min, max) => {
  if (min == null && max == null) {
    return '未設定'
  }

  const minText = min == null ? '' : `${Number(min).toLocaleString()}円`
  const maxText = max == null ? '' : `${Number(max).toLocaleString()}円`

  if (minText && maxText) {
    return `${minText} - ${maxText}`
  }

  return minText || maxText || '未設定'
}


/* 承認 */ //承認者が営業承認者か、管理者かで、ステータス変更が変わる。
const approve = async () => {
  const user = await ensureCurrentUser()
  const approverEmployeeId =
    user?.employee_id || ''

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

    router.push('/scout/list')
  } catch (e) {
    console.error('承認エラー', e)
    alert('承認に失敗しました')
  } 
}

/* 差戻し */
const reject = async () => {
  const returnComment = comment.value.trim()

  if (!returnComment) {
    alert('コメントを入力してください')
    return
  }

  if (returnComment.length > 2000) {
    alert('コメントは2000文字以内で入力してください')
    return
  }

  const user = await ensureCurrentUser()
  const returnedByEmployeeId =
    user?.employee_id || ''

  if (!returnedByEmployeeId) {
    alert('差戻し担当者IDが取得できません')
    return
  }

  if (isAdminReviewer.value && reapplyTarget.value !== 'APPROVER' && reapplyTarget.value !== 'ADMIN') {
    alert('再申請先を選択してください')
    return
  }

  const reasonKeys = Object.entries(reasons.value)
    .filter(([, checked]) => checked)
    .map(([key]) => key)

  try {
    await rejectScout({
      id: String(id),
      returnedByEmployeeId,
      returnComment,
      reasonKeys,
      reapplyTarget: isAdminReviewer.value ? reapplyTarget.value : undefined
    })
  } catch (e) {
    console.error('差戻しエラー', e)
    alert('差戻しに失敗しました')
    return
  }

  // 一覧へ戻る（図の最後）
  router.push('/scout/list')
}
</script>

<style scoped>
.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 48px 24px 64px;
  background: #f9fafb;
}

h2 {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.02em;
  margin: 0 0 32px;
  color: #1f2937;
}

/* メイン */
.main {
  display: flex;
  gap: 24px;
}

/* 左右 */
.left {
  flex: 2;
  min-width: 0;
}

.right {
  flex: 1;
  min-width: 320px;
}

/* 共通BOX */
.box {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  margin-bottom: 20px;
}

.title {
  background: #475569;
  color: white;
  padding: 12px 20px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.01em;
}

.content {
  padding: 20px;
  background: #ffffff;
  min-height: 120px;
  font-size: 14px;
  color: #1f2937;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.content > div {
  margin-bottom: 12px;
}

.content > div:last-child {
  margin-bottom: 0;
}

.content strong {
  color: #374151;
  font-weight: 600;
}

.large {
  min-height: 280px;
}

/* 下2列 */
.bottom-row {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

.bottom-row .box {
  flex: 1;
  min-width: 0;
}

.bottom-row .content {
  min-height: 280px;
}

.history-item {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.history-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.history-meta {
  margin-bottom: 6px;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}

/* コメント */
textarea {
  display: block;
  width: 100%;
  height: 240px;
  border: none;
  border-top: 1px solid #f3f4f6;
  padding: 16px 20px;
  resize: vertical;
  box-sizing: border-box;
  background: #ffffff;
  font-size: 14px;
  font-family: inherit;
  color: #1f2937;
  line-height: 1.6;
  transition: background-color 0.2s ease;
}

textarea:focus {
  outline: none;
  background: #f9fafb;
}

textarea::placeholder {
  color: #9ca3af;
}

.right .box {
  overflow: hidden;
}

.reapply-target {
  padding: 16px 20px;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reapply-target label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  letter-spacing: -0.01em;
}

.reapply-target select {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1.5px solid #d1d5db;
  border-radius: 5px;
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

.reapply-target select:hover {
  border-color: #9ca3af;
}

.reapply-target select:focus {
  outline: none;
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
}

/* チェック */
.check-area {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.check-area label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s ease;
  padding: 4px 0;
}

.check-area label:hover {
  color: #1f2937;
}

.check-area input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #374151;
  flex-shrink: 0;
}

/* ボタン */
.btns {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.approve,
.reject {
  min-width: 140px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  padding: 13px 32px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.08);
}

.approve {
  background: #374151;
  color: white;
  border: 1.5px solid #374151;
}

.approve:hover {
  background: #1f2937;
  border-color: #1f2937;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.15);
}

.approve:active {
  background: #111827;
}

.reject {
  background: #dc2626;
  color: white;
  border: 1.5px solid #dc2626;
}

.reject:hover {
  background: #b91c1c;
  border-color: #b91c1c;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.15);
}

.reject:active {
  background: #991b1b;
}

/* レスポンシブ対応 */
@media (max-width: 1200px) {
  .bottom-row {
    flex-direction: column;
    gap: 20px;
  }

  .bottom-row .box {
    min-width: 0;
  }
}

@media (max-width: 1024px) {
  .main {
    flex-direction: column;
  }

  .left,
  .right {
    flex: 1;
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 32px 16px 48px;
  }

  h2 {
    font-size: 18px;
    margin-bottom: 24px;
  }

  .main {
    gap: 20px;
  }

  .title {
    padding: 10px 16px;
    font-size: 13px;
  }

  .content {
    padding: 16px;
    font-size: 13px;
  }

  .large {
    min-height: 200px;
  }

  .bottom-row .content {
    min-height: 200px;
  }

  textarea {
    padding: 14px 16px;
    font-size: 13px;
    height: 180px;
  }

  .reapply-target {
    padding: 14px 16px;
  }

  .check-area {
    padding: 16px;
    gap: 10px;
  }

  .check-area label {
    font-size: 12px;
  }

  .btns {
    flex-direction: column-reverse;
    gap: 12px;
    padding-top: 20px;
  }

  .approve,
  .reject {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 24px 12px 40px;
  }

  h2 {
    font-size: 16px;
  }

  .title {
    padding: 8px 14px;
  }

  .content {
    padding: 14px;
  }
}
</style>



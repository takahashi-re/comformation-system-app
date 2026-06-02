<template>

  <div class="detail-container">
    <h2>スカウト文詳細</h2>
  

    <!-- 基本情 -->
    <div class="table">
  <div class="row">
    <div class="label">作成者</div>
    <div class="value">{{ detail.creator }}</div>
  </div>

  <div class="row">
    <div class="label">求職者</div>
    <div class="value">{{ detail.candidate }}</div>
  </div>

  <div class="row">
    <div class="label">求人情報</div>
    <div class="value multiline">{{ detail.jobInfo }}</div>
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
import { fetchScoutDetail } from '../../api/scoutApi'
import { SCOUT_STATUS_LABEL } from '../../shared/scoutStatus'

const route = useRoute()

const toGenderLabel = (value) => {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'male' || normalized === 'm' || normalized === '男性') return '男性'
  if (normalized === 'female' || normalized === 'f' || normalized === '女性') return '女性'
  if (normalized === 'other' || normalized === 'others' || normalized === 'non-binary' || normalized === 'その他') return 'その他'
  return '-'
}

const toDisplayValue = (value) => {
  const str = String(value ?? '').trim()
  return str ? str : '-'
}

const toDateTimeLabel = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return toDisplayValue(value)
  return date.toLocaleString('ja-JP')
}

const toStatusLabel = (value) => {
  const status = String(value ?? '').trim()
  if (!status) return '-'
  if (status === 'SENT') return '送信済み'
  return SCOUT_STATUS_LABEL[status] ?? status
}

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
  const id = String(route.params.id ?? '')
  if (!id) return

  try {
    const data = await fetchScoutDetail(id)
    const scout = data?.scout ?? {}

    const candidateInfo = [
      `年齢: ${scout.candidate_age ?? '-'}`,
      `性別: ${toGenderLabel(scout.candidate_gender)}`,
    ].join(' / ')

    const jobInfo = [
      `会社名: ${toDisplayValue(scout.company_name)}`,
      `職種: ${toDisplayValue(scout.job_types)}`,
      `仕事内容: ${toDisplayValue(scout.job_description)}`,
      `最低年収: ${scout.min_salary ?? '-'}`,
      `最高年収: ${scout.max_salary ?? '-'}`,
      `必須スキル: ${toDisplayValue(scout.required_skills)}`,
      `求人の魅力: ${toDisplayValue(scout.job_appeal)}`,
      `勤務地: ${toDisplayValue(scout.work_location)}`,
    ].join('\n')

    detail.value = {
      ...detail.value,
      creator: toDisplayValue(scout.creator_name || scout.created_by_employee_id || scout.creator),
      candidate: candidateInfo,
      createdAt: toDateTimeLabel(scout.created_at),
      status: toStatusLabel(scout.status),
      jobInfo,
      body: toDisplayValue(scout.body),
      reviewer: toDisplayValue(scout.returned_by_name || scout.updated_by_name || scout.reviewer_name),
      comment: toDisplayValue(scout.latest_reject_comment || data?.latestRejectComment)
    }
  } catch (e) {
    console.error('データ取得エラー', e)
  }
})
</script>

<style scoped>
.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px 64px;
}

/* タイトル */
h2 {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.02em;
  margin: 0 0 32px;
  color: #1f2937;
  background: none;
  padding: 0;
}

/* テーブル風 */
.table {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  margin-bottom: 32px;
}

/* 行 */
.row {
  display: grid;
  grid-template-columns: 200px 1fr;
  border-bottom: 1px solid #e5e7eb;
}

.row:last-child {
  border-bottom: none;
}

/* 左ラベル */
.label {
  background: #f9fafb;
  padding: 14px 20px;
  border-right: 1px solid #e5e7eb;
  font-weight: 600;
  font-size: 13px;
  color: #374151;
  display: flex;
  align-items: center;
  letter-spacing: -0.01em;
}

/* 右値 */
.value {
  padding: 14px 20px;
  background: #ffffff;
  font-size: 14px;
  color: #1f2937;
  display: flex;
  align-items: center;
  line-height: 1.6;
}

.multiline {
  white-space: pre-wrap;
}

/* 下の2カラム */
.bottom {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

/* ボックス */
.box {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

/* ボックスタイトル */
.box-title {
  background: #475569;
  color: white;
  padding: 12px 20px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.01em;
}

/* ボディ */
.box-body {
  padding: 20px;
  background: #ffffff;
  min-height: 200px;
  white-space: pre-wrap;
  font-size: 15px;
  color: #1f2937;
  line-height: 1.7;
  word-break: break-word;
}

/* レスポンシブ対応 */
@media (max-width: 1024px) {
  .bottom {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .detail-container {
    padding: 32px 16px 48px;
  }

  h2 {
    font-size: 18px;
    margin-bottom: 24px;
  }

  .table {
    margin-bottom: 24px;
  }

  .row {
    grid-template-columns: 1fr;
  }

  .label {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding: 10px 16px;
    font-size: 12px;
  }

  .value {
    padding: 12px 16px;
    font-size: 13px;
  }

  .box-title {
    padding: 10px 16px;
    font-size: 13px;
  }

  .box-body {
    padding: 16px;
    font-size: 14px;
    min-height: 150px;
  }

  .bottom {
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .detail-container {
    padding: 24px 12px 40px;
  }

  h2 {
    font-size: 16px;
  }

  .label {
    padding: 8px 14px;
  }

  .value {
    padding: 10px 14px;
  }

  .box-title {
    padding: 8px 14px;
  }

  .box-body {
    padding: 14px;
    font-size: 13px;
  }
}
</style>
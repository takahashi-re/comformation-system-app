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
    <div class="label">求職者情報</div>
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
      `希望職種: ${toDisplayValue(scout.candidate_desired_position)}`,
    ].join(' / ')

    const jobInfo = [
      `会社名: ${toDisplayValue(scout.company_name)}`,
      `職種名: ${toDisplayValue(scout.job_title)}`,
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
      reviewer: toDisplayValue(scout.returned_by_name || scout.updated_by_name || scout.reviewer_name || scout.updated_by_employee_id),
      comment: toDisplayValue(scout.latest_reject_comment || data?.latestRejectComment)
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

.multiline {
  white-space: pre-wrap;
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
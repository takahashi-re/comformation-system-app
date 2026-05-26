<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { createScoutDocument, decideScoutDocument, fetchScoutDocuments } from './api'
import type { ScoutDocument, ScoutDocumentStatus } from './types'

const documents = ref<ScoutDocument[]>([])
const loading = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  candidateName: '',
  scoutTitle: '',
  scoutBody: '',
  createdBy: '',
})

const decisionForms = reactive<Record<number, { decidedBy: string; comment: string }>>({})

const statusLabels: Record<ScoutDocumentStatus, string> = {
  pending: '承認待ち',
  approved: '承認済み',
  returned: '差戻し',
}

const counts = computed(() => ({
  pending: documents.value.filter((document) => document.status === 'pending').length,
  approved: documents.value.filter((document) => document.status === 'approved').length,
  returned: documents.value.filter((document) => document.status === 'returned').length,
}))

const ensureDecisionForm = (id: number) => {
  decisionForms[id] ??= { decidedBy: '', comment: '' }
  return decisionForms[id]
}

const loadDocuments = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    documents.value = await fetchScoutDocuments()
    documents.value.forEach((document) => ensureDecisionForm(document.id))
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '一覧の取得に失敗しました。'
  } finally {
    loading.value = false
  }
}

const submitDocument = async () => {
  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const created = await createScoutDocument({ ...form })
    documents.value = [created, ...documents.value]
    ensureDecisionForm(created.id)
    form.candidateName = ''
    form.scoutTitle = ''
    form.scoutBody = ''
    form.createdBy = ''
    successMessage.value = 'スカウト文を登録しました。'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登録に失敗しました。'
  } finally {
    submitting.value = false
  }
}

const handleDecision = async (document: ScoutDocument, action: 'approve' | 'return') => {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const decisionForm = ensureDecisionForm(document.id)
    const updated = await decideScoutDocument(document.id, {
      action,
      comment: decisionForm.comment,
      decidedBy: decisionForm.decidedBy,
    })

    documents.value = documents.value.map((current) => (current.id === updated.id ? updated : current))
    successMessage.value = action === 'approve' ? 'スカウト文を承認しました。' : 'スカウト文を差戻しました。'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '更新に失敗しました。'
  }
}

onMounted(loadDocuments)
</script>

<template>
  <main class="layout">
    <section class="hero-card">
      <div>
        <p class="eyebrow">Scout Workflow</p>
        <h1>スカウト文の作成と承認・差戻し</h1>
        <p class="lead">
          採用担当者がスカウト文を作成し、承認者がその場で承認または差戻しできる最小構成のアプリです。
        </p>
      </div>
      <div class="stats">
        <article>
          <span>承認待ち</span>
          <strong>{{ counts.pending }}</strong>
        </article>
        <article>
          <span>承認済み</span>
          <strong>{{ counts.approved }}</strong>
        </article>
        <article>
          <span>差戻し</span>
          <strong>{{ counts.returned }}</strong>
        </article>
      </div>
    </section>

    <section class="panel">
      <h2>スカウト文を作成</h2>
      <form class="form" @submit.prevent="submitDocument">
        <label>
          候補者名
          <input v-model="form.candidateName" type="text" placeholder="例: 山田 花子" />
        </label>
        <label>
          件名
          <input v-model="form.scoutTitle" type="text" placeholder="例: フロントエンドエンジニア募集" />
        </label>
        <label>
          作成者
          <input v-model="form.createdBy" type="text" placeholder="例: 採用担当A" />
        </label>
        <label class="full-width">
          本文
          <textarea
            v-model="form.scoutBody"
            rows="6"
            placeholder="候補者に送るスカウト文を入力してください。"
          />
        </label>
        <button :disabled="submitting" class="primary-button" type="submit">
          {{ submitting ? '登録中...' : '承認依頼を登録する' }}
        </button>
      </form>
      <p v-if="successMessage" class="message success">{{ successMessage }}</p>
      <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
    </section>

    <section class="panel">
      <div class="section-header">
        <h2>スカウト文一覧</h2>
        <button class="secondary-button" type="button" @click="loadDocuments">再読み込み</button>
      </div>

      <p v-if="loading" class="empty-state">読み込み中です...</p>
      <p v-else-if="documents.length === 0" class="empty-state">
        まだスカウト文がありません。最初の 1 件を登録してください。
      </p>

      <div v-else class="document-list">
        <article v-for="document in documents" :key="document.id" class="document-card">
          <div class="document-header">
            <div>
              <p class="candidate-name">{{ document.candidateName }}</p>
              <h3>{{ document.scoutTitle }}</h3>
            </div>
            <span class="status-badge" :data-status="document.status">
              {{ statusLabels[document.status] }}
            </span>
          </div>

          <dl class="meta-grid">
            <div>
              <dt>作成者</dt>
              <dd>{{ document.createdBy }}</dd>
            </div>
            <div>
              <dt>作成日時</dt>
              <dd>{{ new Date(document.createdAt).toLocaleString('ja-JP') }}</dd>
            </div>
            <div v-if="document.decidedBy">
              <dt>承認 / 差戻し者</dt>
              <dd>{{ document.decidedBy }}</dd>
            </div>
          </dl>

          <p class="body-text">{{ document.scoutBody }}</p>

          <p v-if="document.decisionComment" class="decision-comment">
            コメント: {{ document.decisionComment }}
          </p>

          <div v-if="document.status === 'pending'" class="decision-box">
            <label>
              承認者名
              <input v-model="ensureDecisionForm(document.id).decidedBy" type="text" placeholder="例: 部門責任者" />
            </label>
            <label>
              コメント
              <textarea
                v-model="ensureDecisionForm(document.id).comment"
                rows="3"
                placeholder="必要に応じてコメントを入力"
              />
            </label>
            <div class="button-row">
              <button class="primary-button" type="button" @click="handleDecision(document, 'approve')">
                承認する
              </button>
              <button class="danger-button" type="button" @click="handleDecision(document, 'return')">
                差戻す
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

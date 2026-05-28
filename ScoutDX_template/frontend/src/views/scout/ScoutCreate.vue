<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

type JobInfo = {
  companyName: string
  jobTitle: string
  businessContent: string
  requiredSkills: string
  location: string
  salary: number | null
  appealPoints: string
}

type ApplicantInfo = {
  gender: string
  age: number | null
  desiredJobTitle: string
  aiInstructions: string
}

type ScoutCreateRequest = {
  jobInfo: JobInfo
  applicantInfo: ApplicantInfo
}

const router = useRouter()

// フォームデータ
const jobInfo = reactive<JobInfo>({
  companyName: '',
  jobTitle: '',
  businessContent: '',
  requiredSkills: '',
  location: '',
  salary: null,
  appealPoints: ''
})

const applicantInfo = reactive<ApplicantInfo>({
  gender: '',
  age: null,
  desiredJobTitle: '',
  aiInstructions: ''
})

// ローディング状態
const isLoading = ref(false)
const isGenerating = ref(false)

// バリデーションエラー
const errors = reactive<Record<string, string>>({})

// 性別選択
const genderOptions = [
  { label: '男性', value: 'male' },
  { label: '女性', value: 'female' },
  { label: '不問', value: 'any' }
]

// バリデーション
const validateForm = (): boolean => {
  // エラーをクリア
  Object.keys(errors).forEach(key => delete errors[key])

  // 必須項目チェック
  if (!jobInfo.companyName) {
    errors.companyName = '会社名を入力してください'
  } else if (jobInfo.companyName.length > 255) {
    errors.companyName = '会社名は255文字以内で入力してください'
  }

  if (!jobInfo.jobTitle) {
    errors.jobTitle = '職種を入力してください'
  } else if (jobInfo.jobTitle.length > 255) {
    errors.jobTitle = '職種は255文字以内で入力してください'
  }

  if (!jobInfo.businessContent) {
    errors.businessContent = '業務内容を入力してください'
  } else if (jobInfo.businessContent.length > 2000) {
    errors.businessContent = '業務内容は2000文字以内で入力してください'
  }

  if (!jobInfo.requiredSkills) {
    errors.requiredSkills = '必須スキルを入力してください'
  } else if (jobInfo.requiredSkills.length > 2000) {
    errors.requiredSkills = '必須スキルは2000文字以内で入力してください'
  }

  if (!jobInfo.location) {
    errors.location = '勤務地を入力してください'
  } else if (jobInfo.location.length > 255) {
    errors.location = '勤務地は255文字以内で入力してください'
  }

  if (!jobInfo.salary) {
    errors.salary = '給与単価を入力してください'
  } else if (typeof jobInfo.salary !== 'number') {
    errors.salary = '給与単価は数値で入力してください'
  }

  if (!jobInfo.appealPoints) {
    errors.appealPoints = '求人の魅力を入力してください'
  } else if (jobInfo.appealPoints.length > 2000) {
    errors.appealPoints = '求人の魅力は2000文字以内で入力してください'
  }

  // 任意項目の文字数チェック
  if (applicantInfo.age !== null && (applicantInfo.age < 0 || applicantInfo.age > 100)) {
    errors.age = '年齢は0〜100の範囲で入力してください'
  }

  if (applicantInfo.desiredJobTitle && applicantInfo.desiredJobTitle.length > 255) {
    errors.desiredJobTitle = '希望職種は255文字以内で入力してください'
  }

  if (applicantInfo.aiInstructions && applicantInfo.aiInstructions.length > 2000) {
    errors.aiInstructions = 'AI指示は2000文字以内で入力してください'
  }

  return Object.keys(errors).length === 0
}

// スカウト文作成（AI生成）
const handleCreateScout = async () => {
  // バリデーション
  if (!validateForm()) {
    ElMessage.error('入力内容に誤りがあります')
    return
  }

  try {
    isGenerating.value = true

    // バックエンドAPIへリクエスト
    const requestData: ScoutCreateRequest = {
      jobInfo,
      applicantInfo
    }

    const response = await fetch('/api/scout/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      throw new Error('スカウト文の生成に失敗しました')
    }

    const data = await response.json()

    ElMessage.success('スカウト文を生成しました')

    // 生成結果画面へ遷移（スカウト文IDを渡す）
    router.push({
      name: 'ScoutPreview',
      params: { id: data.scoutId }
    })

  } catch (error) {
    console.error('スカウト文生成エラー:', error)
    ElMessage.error('スカウト文の生成に失敗しました。もう一度お試しください。')
  } finally {
    isGenerating.value = false
  }
}

// 一覧画面に戻る
const handleBack = () => {
  router.push({ name: 'ScoutList' })
}
</script>

<template>
  <div class="scout-create">
    <!-- ヘッダー -->
    <header class="page-header">
      <nav class="header-nav">
        <router-link to="/scout/list" class="nav-link">スカウト文一覧</router-link>
        <div class="user-info">
          <span class="username">{{ 'ユーザー名' }}</span>
          <router-link to="/logout" class="logout-link">ログアウト</router-link>
          <router-link to="/password-change" class="password-link">パスワード変更</router-link>
        </div>
      </nav>
    </header>

    <!-- メインコンテンツ -->
    <main class="page-content">
      <h1 class="page-title">求人情報入力（営業担当）</h1>
      <p class="page-description">スカウト文に必要な求人情報を入力する</p>

      <form @submit.prevent="handleCreateScout" class="scout-form">
        <!-- 求人情報入力フォーム -->
        <section class="form-section">
          <h2 class="section-title">求人情報入力フォーム</h2>

          <!-- 会社名 -->
          <div class="form-group">
            <label for="companyName" class="form-label required">会社名</label>
            <input
              id="companyName"
              v-model="jobInfo.companyName"
              type="text"
              class="form-input"
              :class="{ 'is-error': errors.companyName }"
              maxlength="255"
              placeholder="会社名を入力"
            />
            <span v-if="errors.companyName" class="error-message">
              {{ errors.companyName }}
            </span>
          </div>

          <!-- 職種 -->
          <div class="form-group">
            <label for="jobTitle" class="form-label required">職種</label>
            <input
              id="jobTitle"
              v-model="jobInfo.jobTitle"
              type="text"
              class="form-input"
              :class="{ 'is-error': errors.jobTitle }"
              maxlength="255"
              placeholder="職種を入力"
            />
            <span v-if="errors.jobTitle" class="error-message">
              {{ errors.jobTitle }}
            </span>
          </div>

          <!-- 業務内容 -->
          <div class="form-group">
            <label for="businessContent" class="form-label required">業務内容</label>
            <textarea
              id="businessContent"
              v-model="jobInfo.businessContent"
              class="form-textarea"
              :class="{ 'is-error': errors.businessContent }"
              maxlength="2000"
              rows="4"
              placeholder="業務内容を入力"
            />
            <span v-if="errors.businessContent" class="error-message">
              {{ errors.businessContent }}
            </span>
          </div>

          <!-- 必須スキル -->
          <div class="form-group">
            <label for="requiredSkills" class="form-label required">必須スキル</label>
            <textarea
              id="requiredSkills"
              v-model="jobInfo.requiredSkills"
              class="form-textarea"
              :class="{ 'is-error': errors.requiredSkills }"
              maxlength="2000"
              rows="4"
              placeholder="必須スキルを入力"
            />
            <span v-if="errors.requiredSkills" class="error-message">
              {{ errors.requiredSkills }}
            </span>
          </div>

          <!-- 勤務地 -->
          <div class="form-group">
            <label for="location" class="form-label required">勤務地</label>
            <input
              id="location"
              v-model="jobInfo.location"
              type="text"
              class="form-input"
              :class="{ 'is-error': errors.location }"
              maxlength="255"
              placeholder="勤務地を入力"
            />
            <span v-if="errors.location" class="error-message">
              {{ errors.location }}
            </span>
          </div>

          <!-- 給与単価 -->
          <div class="form-group">
            <label for="salary" class="form-label required">給与単価</label>
            <input
              id="salary"
              v-model.number="jobInfo.salary"
              type="number"
              class="form-input"
              :class="{ 'is-error': errors.salary }"
              placeholder="給与単価を入力"
            />
            <span v-if="errors.salary" class="error-message">
              {{ errors.salary }}
            </span>
          </div>

          <!-- 求人の魅力 -->
          <div class="form-group">
            <label for="appealPoints" class="form-label required">求人の魅力</label>
            <textarea
              id="appealPoints"
              v-model="jobInfo.appealPoints"
              class="form-textarea"
              :class="{ 'is-error': errors.appealPoints }"
              maxlength="2000"
              rows="4"
              placeholder="求人の魅力を入力"
            />
            <span v-if="errors.appealPoints" class="error-message">
              {{ errors.appealPoints }}
            </span>
          </div>
        </section>

        <!-- 求職者情報入力フォーム -->
        <section class="form-section">
          <h2 class="section-title">求職者情報入力フォーム</h2>

          <!-- 性別 -->
          <div class="form-group">
            <label for="gender" class="form-label">性別</label>
            <select
              id="gender"
              v-model="applicantInfo.gender"
              class="form-select"
            >
              <option value="">選択してください</option>
              <option
                v-for="option in genderOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- 年齢 -->
          <div class="form-group">
            <label for="age" class="form-label">年齢</label>
            <input
              id="age"
              v-model.number="applicantInfo.age"
              type="number"
              class="form-input"
              :class="{ 'is-error': errors.age }"
              min="0"
              max="100"
              placeholder="年齢を入力"
            />
            <span v-if="errors.age" class="error-message">
              {{ errors.age }}
            </span>
          </div>

          <!-- 希望職種 -->
          <div class="form-group">
            <label for="desiredJobTitle" class="form-label">希望職種</label>
            <input
              id="desiredJobTitle"
              v-model="applicantInfo.desiredJobTitle"
              type="text"
              class="form-input"
              :class="{ 'is-error': errors.desiredJobTitle }"
              maxlength="255"
              placeholder="希望職種を入力"
            />
            <span v-if="errors.desiredJobTitle" class="error-message">
              {{ errors.desiredJobTitle }}
            </span>
          </div>

          <!-- 人物像（AI指示） -->
          <div class="form-group">
            <label for="aiInstructions" class="form-label">人物像</label>
            <textarea
              id="aiInstructions"
              v-model="applicantInfo.aiInstructions"
              class="form-textarea"
              :class="{ 'is-error': errors.aiInstructions }"
              maxlength="2000"
              rows="4"
              placeholder="AIへの指示を入力"
            />
            <span v-if="errors.aiInstructions" class="error-message">
              {{ errors.aiInstructions }}
            </span>
          </div>
        </section>

        <!-- 文体指定 -->
        <section class="form-section text-style-section">
          <h2 class="section-title-alt">文体指定</h2>
          <input
            type="text"
            class="form-input-alt"
            placeholder="文体を指定"
          />
        </section>

        <!-- アクションボタン -->
        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isGenerating"
          >
            <span v-if="isGenerating">生成中...</span>
            <span v-else>文章作成</span>
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<style scoped>
.scout-create {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* ヘッダー */
.page-header {
  background-color: #2c5aa0;
  color: white;
  padding: 0;
}

.header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
}

.nav-link:hover {
  text-decoration: underline;
}

.user-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.username {
  font-weight: 600;
}

.logout-link,
.password-link {
  color: white;
  text-decoration: none;
  font-size: 14px;
}

.logout-link:hover,
.password-link:hover {
  text-decoration: underline;
}

/* メインコンテンツ */
.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.page-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 32px;
}

/* フォーム */
.scout-form {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 32px;
}

.form-section {
  margin-bottom: 40px;
}

.section-title {
  background-color: #2c5aa0;
  color: white;
  padding: 12px 16px;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  border-radius: 4px;
}

.section-title-alt {
  background-color: #a8d5a8;
  color: #333;
  padding: 12px 16px;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  border-radius: 4px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-label.required::after {
  content: ' *';
  color: #f56c6c;
}

.form-input,
.form-textarea,
.form-select,
.form-input-alt {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus,
.form-input-alt:focus {
  outline: none;
  border-color: #2c5aa0;
}

.form-input.is-error,
.form-textarea.is-error {
  border-color: #f56c6c;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.error-message {
  display: block;
  color: #f56c6c;
  font-size: 12px;
  margin-top: 4px;
}

.text-style-section {
  background-color: #f0f9f0;
  padding: 20px;
  border-radius: 4px;
}

/* アクションボタン */
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;
}

.btn {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #2c5aa0;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1e3a6b;
}

.btn-primary:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .page-content {
    padding: 20px 16px;
  }

  .scout-form {
    padding: 20px;
  }

  .header-nav {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
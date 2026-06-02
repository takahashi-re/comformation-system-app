<template>
  <div class="scout-create">
    <!-- メインコンテンツ -->
    <main class="page-content">
      <h1 class="page-title">求人情報入力</h1>

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
            <label for="businessContent" class="form-label required"
              >業務内容</label
            >
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
            <label for="requiredSkills" class="form-label required"
              >必須スキル</label
            >
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
            <label class="form-label required">給与単価</label>
            <div class="salary-range">
              <div class="salary-range-item">
                <input
                  id="minSalary"
                  v-model.number="jobInfo.minSalary"
                  type="number"
                  step="10000"
                  class="form-input"
                  :class="{ 'is-error': errors.minSalary }"
                  min="0"
                  placeholder="最小給与を入力"
                />
                <span v-if="errors.minSalary" class="error-message">
                  {{ errors.minSalary }}
                </span>
              </div>
              <span class="salary-range-separator">〜</span>
              <div class="salary-range-item">
                <input
                  id="maxSalary"
                  v-model.number="jobInfo.maxSalary"
                  type="number"
                  step="10000"
                  class="form-input"
                  :class="{ 'is-error': errors.maxSalary }"
                  min="0"
                  placeholder="最大給与を入力"
                />
                <span v-if="errors.maxSalary" class="error-message">
                  {{ errors.maxSalary }}
                </span>
              </div>
            </div>
          </div>

          <!-- 求人の魅力 -->
          <div class="form-group">
            <label for="appealPoints" class="form-label required"
              >求人の魅力</label
            >
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
            <label for="gender" class="form-label required">性別</label>
            <select
              id="gender"
              v-model="applicantInfo.gender"
              class="form-select"
              :class="{ 'is-error': errors.gender }"
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
            <span v-if="errors.gender" class="error-message">
              {{ errors.gender }}
            </span>
          </div>

          <!-- 年齢 -->
          <div class="form-group">
            <label for="age" class="form-label required">年齢</label>
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
            <label for="desiredJobTitle" class="form-label required"
              >希望職種</label
            >
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
            <label for="aiInstructions" class="form-label">AI指示</label>
            <textarea
              id="aiInstructions"
              v-model="applicantInfo.aiInstructions"
              class="form-textarea"
              :class="{ 'is-error': errors.aiInstructions }"
              maxlength="2000"
              rows="4"
              placeholder="AIへの追加指示があれば入力してください"
            />
            <span v-if="errors.aiInstructions" class="error-message">
              {{ errors.aiInstructions }}
            </span>
          </div>
        </section>

        <!-- 文体指定 -->
        <section class="form-section text-style-section">
          <h2 class="section-title-alt">文体指定</h2>
          <select class="form-select" v-model="textStyle">
            <option
              v-for="option in textStyleOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
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

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { apiClient } from "../../api/client";
import { useLoginStore } from "../../store/login.Store";

// 求人情報
interface JobInfo {
  companyName: string;
  jobTitle: string;
  businessContent: string;
  requiredSkills: string;
  location: string;
  minSalary: number | null;
  maxSalary: number | null;
  appealPoints: string;
}

// 求職者情報
interface ApplicantInfo {
  gender: string;
  age: number | null;
  desiredJobTitle: string;
  aiInstructions: string;
}

interface ScoutGenerateRequest {
  jobInfo: JobInfo;
  applicantInfo: ApplicantInfo;
  textStyle: "casual" | "formal";
  createdByEmployeeId?: string;
}

interface ScoutGenerateResponse {
  body: string;
  scoutId: string;
}

const router = useRouter();
const loginStore = useLoginStore();

// フォームデータ
const jobInfo = reactive<JobInfo>({
  companyName: "",
  jobTitle: "",
  businessContent: "",
  requiredSkills: "",
  location: "",
  minSalary: null,
  maxSalary: null,
  appealPoints: "",
});

const applicantInfo = reactive<ApplicantInfo>({
  gender: "",
  age: null,
  desiredJobTitle: "",
  aiInstructions: "",
});

// ローディング状態
// const isLoading = ref(false)
const isGenerating = ref(false);
const textStyle = ref<"casual" | "formal">("formal");

const textStyleOptions = [
  { label: "カジュアル", value: "casual" },
  { label: "フォーマル", value: "formal" },
];

// バリデーションエラー
const errors = reactive<Record<string, string>>({});

// 性別選択肢
const genderOptions = [
  { label: "男性", value: "male" },
  { label: "女性", value: "female" },
  { label: "不問", value: "any" },
];

// バリデーション
const validateForm = (): boolean => {
  // エラーをクリア
  Object.keys(errors).forEach((key) => delete errors[key]);

  // 必須項目チェック
  if (!jobInfo.companyName) {
    errors.companyName = "会社名を入力してください";
  } else if (jobInfo.companyName.length > 255) {
    errors.companyName = "会社名は255文字以内で入力してください";
  }

  if (!jobInfo.jobTitle) {
    errors.jobTitle = "職種を入力してください";
  } else if (jobInfo.jobTitle.length > 255) {
    errors.jobTitle = "職種は255文字以内で入力してください";
  }

  if (!jobInfo.businessContent) {
    errors.businessContent = "業務内容を入力してください";
  } else if (jobInfo.businessContent.length > 2000) {
    errors.businessContent = "業務内容は2000文字以内で入力してください";
  }

  if (!jobInfo.requiredSkills) {
    errors.requiredSkills = "必須スキルを入力してください";
  } else if (jobInfo.requiredSkills.length > 2000) {
    errors.requiredSkills = "必須スキルは2000文字以内で入力してください";
  }

  if (!jobInfo.location) {
    errors.location = "勤務地を入力してください";
  } else if (jobInfo.location.length > 255) {
    errors.location = "勤務地は255文字以内で入力してください";
  }

  if (jobInfo.minSalary === null || Number.isNaN(jobInfo.minSalary)) {
    errors.minSalary = "最小給与を入力してください";
  } else if (typeof jobInfo.minSalary !== "number" || jobInfo.minSalary < 0) {
    errors.minSalary = "最小給与は0以上の数値で入力してください";
  }

  if (jobInfo.maxSalary === null || Number.isNaN(jobInfo.maxSalary)) {
    errors.maxSalary = "最大給与を入力してください";
  } else if (typeof jobInfo.maxSalary !== "number" || jobInfo.maxSalary < 0) {
    errors.maxSalary = "最大給与は0以上の数値で入力してください";
  }

  if (
    jobInfo.minSalary !== null &&
    jobInfo.maxSalary !== null &&
    !Number.isNaN(jobInfo.minSalary) &&
    !Number.isNaN(jobInfo.maxSalary) &&
    jobInfo.minSalary > jobInfo.maxSalary
  ) {
    errors.maxSalary = "最大給与は最小給与以上で入力してください";
  }

  if (!jobInfo.appealPoints) {
    errors.appealPoints = "求人の魅力を入力してください";
  } else if (jobInfo.appealPoints.length > 2000) {
    errors.appealPoints = "求人の魅力は2000文字以内で入力してください";
  }

  if (!applicantInfo.gender) {
    errors.gender = "性別を選択してください";
  }

  if (applicantInfo.age === null || Number.isNaN(applicantInfo.age)) {
    errors.age = "年齢を入力してください";
  } else if (applicantInfo.age < 0 || applicantInfo.age > 100) {
    errors.age = "年齢は0〜100の範囲で入力してください";
  }

  if (!applicantInfo.desiredJobTitle) {
    errors.desiredJobTitle = "希望職種を入力してください";
  } else if (applicantInfo.desiredJobTitle.length > 255) {
    errors.desiredJobTitle = "希望職種は255文字以内で入力してください";
  }

  if (
    applicantInfo.aiInstructions &&
    applicantInfo.aiInstructions.length > 2000
  ) {
    errors.aiInstructions = "AI指示は2000文字以内で入力してください";
  }

  return Object.keys(errors).length === 0;
};

// スカウト文作成（バックエンド生成）
const handleCreateScout = async () => {
  // バリデーション
  if (!validateForm()) {
    window.alert("入力内容に誤りがあります");
    return;
  }

  try {
    isGenerating.value = true;

    const requestData: ScoutGenerateRequest = {
      jobInfo,
      applicantInfo,
      textStyle: textStyle.value,
      createdByEmployeeId: String(loginStore.user?.employee_id ?? ""),
    };

    const { data } = await apiClient.post<ScoutGenerateResponse>(
      "/api/ai/generate",
      requestData,
    );
    sessionStorage.setItem("generatedScoutMessage", data.body);
    router.push(`/scout/${data.scoutId}/edit`);
  } catch (error) {
    console.error("スカウト文生成エラー:", error);
    window.alert("スカウト文の生成に失敗しました。もう一度お試しください。");
  } finally {
    isGenerating.value = false;
  }
};
</script>

<style scoped>
.scout-create {
  --bg-page: #f9fafb;
  --bg-card: #ffffff;
  --bg-section: #f3f4f6;
  --text-primary: #1f2937;
  --text-secondary: #4b5563;
  --text-tertiary: #9ca3af;
  --border-light: #e5e7eb;
  --border-medium: #d1d5db;
  --primary: #374151;
  --primary-hover: #1f2937;
  --primary-light: #f3f4f6;
  --danger: #dc2626;
  --danger-light: #fee2e2;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 2px 4px 0 rgb(0 0 0 / 0.08);
  --shadow-lg: 0 4px 6px 0 rgb(0 0 0 / 0.1);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  min-height: 100vh;
  background: var(--bg-page);
  color: var(--text-primary);
}

.page-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px 64px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.02em;
  margin: 0 0 32px;
  color: var(--text-primary);
}

.scout-form {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 40px;
  box-shadow: var(--shadow-sm);
}

.form-section {
  margin-bottom: 48px;
}

.form-section:last-of-type {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border-light);
  letter-spacing: -0.01em;
}

.section-title-alt {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px;
  letter-spacing: -0.01em;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
}

.form-section > .form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 13px;
  letter-spacing: -0.01em;
}

.form-label.required::after {
  content: "必須";
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
  color: var(--danger);
  background: var(--danger-light);
  border-radius: 3px;
  line-height: 1.3;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 1.5px solid var(--border-medium);
  border-radius: var(--radius-sm);
  background: #fff;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-tertiary);
}

.form-input:hover:not(:disabled),
.form-textarea:hover:not(:disabled),
.form-select:hover:not(:disabled) {
  border-color: var(--primary);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--bg-page);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.form-input.is-error,
.form-textarea.is-error,
.form-select.is-error {
  border-color: var(--danger);
  background: var(--danger-light);
}

.form-input.is-error:focus,
.form-textarea.is-error:focus,
.form-select.is-error:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 110px;
  height: auto;
  padding: 12px 14px;
  line-height: 1.6;
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%234b5563' d='M4.427 6.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 6H4.604a.25.25 0 00-.177.427z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}

/* 性別セレクトの幅を制限 */
#gender {
  max-width: 300px;
}

.salary-range {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: flex-start;
  gap: 20px;
}

.salary-range-item {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.salary-range-item .form-input {
  width: 100%;
}

.salary-range-item .error-message {
  margin-top: 6px;
}

.salary-range-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 16px;
  padding: 0 8px;
  flex-shrink: 0;
  min-width: 40px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--danger);
  font-size: 12px;
  font-weight: 500;
  margin-top: 6px;
  line-height: 1.4;
}

.error-message::before {
  content: "⚠";
  font-size: 13px;
}

.text-style-section {
  background: var(--bg-section);
  border: 1px solid var(--border-light);
  padding: 20px;
  border-radius: var(--radius-md);
  margin-top: 40px;
}

.text-style-section .form-select {
  max-width: 240px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--border-light);
}

.btn {
  min-width: 200px;
  height: 48px;
  padding: 0 32px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
  box-shadow: var(--shadow-md);
}

.btn-primary {
  background: var(--primary);
  color: #fff;
  border: 1.5px solid var(--primary);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
  box-shadow: var(--shadow-lg);
}

.btn-primary:active:not(:disabled) {
  background: #111827;
}

.btn-primary:disabled {
  background: var(--text-tertiary);
  border-color: var(--text-tertiary);
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

/* Number input arrows styling */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 1;
}

@media (max-width: 768px) {
  .page-content {
    padding: 32px 16px 48px;
  }

  .page-title {
    font-size: 18px;
    margin-bottom: 24px;
  }

  .scout-form {
    padding: 24px 20px;
    border-radius: var(--radius-md);
  }

  .form-section {
    margin-bottom: 36px;
  }

  .section-title {
    font-size: 15px;
    margin-bottom: 16px;
    padding-bottom: 8px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  #gender {
    max-width: 100%;
  }

  .salary-range {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .salary-range-separator {
    display: none;
  }

  .text-style-section {
    padding: 16px;
    margin-top: 32px;
  }

  .text-style-section .form-select {
    max-width: 100%;
  }

  .form-actions {
    justify-content: stretch;
    margin-top: 36px;
    padding-top: 24px;
  }

  .btn {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 24px 12px 40px;
  }

  .scout-form {
    padding: 20px 16px;
  }

  .page-title {
    font-size: 16px;
  }
}
</style>

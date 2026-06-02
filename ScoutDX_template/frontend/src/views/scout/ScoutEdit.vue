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
          :readonly="isBodyReadOnly"
          class="textarea"
          placeholder="（スカウト文を入力・編集）"
        ></textarea>
      </div>
    </div>

    <!-- 右 -->
    <div class="right">
      <div
        class="box-title"
        style="display: flex; justify-content: space-between; align-items: center; gap: 8px"
      >
        <span>差戻しコメント</span>
        <span
          v-if="rejecterDisplay"
          style="font-size: 12px; font-weight: 500; white-space: nowrap"
        >
          {{ rejecterDisplay }}
        </span>
      </div>
      <div class="box-content">
        <div class="comment-box" v-if="latestRejectComment">
          {{ latestRejectComment }}
        </div>
        <div class="comment-box" v-else>差戻しコメントはありません</div>
      </div>
      <div class="actions">
        <button class="btn save" :disabled="isBodyReadOnly" @click="saveDraft">
          保存
        </button>
        <button class="btn submit" :disabled="isBodyReadOnly" @click="submit">
          申請
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { fetchScoutDetail, updateScout } from "../../api/scoutApi";
import { fetchAIConfig } from "../../api/aiConfigApi";

const route = useRoute();
const router = useRouter();
const scoutId = route.params.id;

// state
const scout = ref({
  id: null,
  body: "",
});

const latestRejectComment = ref(null);
const rejecterDisplay = ref("");
const loading = ref(true);
const ngWords = ref([]);
const maxLength = ref(Infinity);
const nonEditableStatuses = new Set([
  "PENDING_APPROVER",
  "PENDING_ADMIN",
  "AVAILABLE",
]);

const isBodyReadOnly = computed(() => {
  const status = String(scout.value?.status ?? "").trim();
  return nonEditableStatuses.has(status);
});

function normalizeText(value) {
  return String(value ?? "").toLowerCase();
}

function findIncludedNgWords(text, words) {
  const normalizedText = normalizeText(text);

  return words.filter((word) => {
    const normalizedWord = normalizeText(word).trim();
    return normalizedWord.length > 0 && normalizedText.includes(normalizedWord);
  });
}

function resolveNextStatus(currentStatus) {
  const status = String(currentStatus ?? "").trim();

  if (status === "REJECTED_BY_ADMIN_TO_ADMIN") {
    return "PENDING_ADMIN";
  }

  return "PENDING_APPROVER";
}

// 初期表示（DBから取得）
onMounted(async () => {
  loading.value = true;

  try {
    const [res, config] = await Promise.all([
      fetchScoutDetail(scoutId),
      fetchAIConfig(),
    ]);

    // 最新スカウト文
    scout.value = res.scout;

    // 最新差戻しコメント
    latestRejectComment.value = res.latestRejectComment;

    const scoutRecord = res?.scout && typeof res.scout === "object" ? res.scout : {};
    const returnedByEmployeeId = String(
      scoutRecord["returned_by_employee_id"] ?? "",
    ).trim();
    const returnedByName = String(scoutRecord["returned_by_name"] ?? "").trim();
    const returnedByPositionName = String(
      scoutRecord["returned_by_position_name"] ?? "",
    ).trim();

    rejecterDisplay.value = returnedByEmployeeId && returnedByName
      ? `${returnedByName}(${returnedByPositionName || "-"})`
      : "";

    // ここでテキストエリアに反映
    scout.value.body = res.scout.body;

    ngWords.value = Array.isArray(config?.ngWords) ? config.ngWords : [];
    maxLength.value =
      Number(config?.maxLength) > 0 ? Number(config.maxLength) : 100;
  } finally {
    loading.value = false;
  }
});

/**
 * 保存（下書き保存）
 * → status: DRAFT
 */
const saveDraft = async () => {
  if (isBodyReadOnly.value) {
    alert("このステータスでは編集できません");
    return;
  }

  await updateScout({
    id: scout.value.id,
    body: scout.value.body,
    status: "DRAFT",
  });

  // 一覧へ戻る（図の最後）
  router.push("/scout/list");
};

/**
 * 申請
 * → バリデーション → OKなら承認待ち
 */
const submit = async () => {
  if (isBodyReadOnly.value) {
    alert("このステータスでは編集できません");
    return;
  }

  // バリデーションチェック（図の分岐）
  const body = String(scout.value.body ?? "");

  if (!body.trim()) {
    alert("スカウト文を入力してください");
    return;
  }

  const hitWords = findIncludedNgWords(body, ngWords.value);
  if (hitWords.length > 0) {
    alert(`NGワードが含まれています: ${hitWords.join(", ")}`);
    return;
  }

  if (body.length > maxLength.value) {
    alert(
      `文字数が上限を超えています（${body.length}/${maxLength.value}文字）`,
    );
    return;
  }

  try {
    const nextStatus = resolveNextStatus(scout.value.status);

    await updateScout({
      id: scout.value.id,
      body,
      status: nextStatus,
    });

    alert("申請しました");

    // 一覧へ戻る（図の最後）
    router.push("/scout/list");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      const message =
        responseData && typeof responseData === "object" && "message" in responseData
          ? String(responseData.message || "申請に失敗しました")
          : "申請に失敗しました";
      alert(message);
      return;
    }

    alert("申請に失敗しました");
  }
};
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
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial,
    sans-serif;
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
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial,
    sans-serif;
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
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial,
    sans-serif;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
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

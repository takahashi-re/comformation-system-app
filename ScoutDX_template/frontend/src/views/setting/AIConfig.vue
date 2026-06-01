<template>
  <div class="ai-config">
    <h2>最大文字数設定</h2>
    <div class="max-length-input">
      <input type="number" v-model.number="maxLengthInput" min="1" />
      <button @click="updateMaxLength">更新</button>
      <span v-if="maxLength !== maxLengthInput">（未保存）</span>
    </div>

    <h2>NGワード設定</h2>
    <div class="ngword-input">
      <input
        v-model="newNgWord"
        placeholder="NGワードを入力"
        @keyup.enter="addNgWord"
      />
      <button @click="addNgWord">追加</button>
    </div>
    <ul class="ngword-list">
      <li v-for="(word, idx) in ngWords" :key="word">
        {{ word }}
        <button @click="removeNgWord(idx)">×</button>
      </li>
    </ul>

    <div class="save-section">
      <button :disabled="loading" @click="saveConfig">保存</button>
      <span v-if="saveMessage">{{ saveMessage }}</span>
      <span v-if="errorMessage" class="error">{{ errorMessage }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAIConfigStore } from "../../store/aiConfigStore";

const aiConfigStore = useAIConfigStore();
const { aiConfig, loading, error, load, save } = aiConfigStore;

// 画面上の一時編集状態（追加・削除・更新ではAPI送信しない）
const ngWords = ref<string[]>([]);
const newNgWord = ref("");
const maxLength = ref<number>(100);
const maxLengthInput = ref<number>(100);
const saveMessage = ref("");
const errorMessage = ref("");

onMounted(async () => {
  await load();
  if (error.value) {
    errorMessage.value = error.value;
    return;
  }

  ngWords.value = [...aiConfig.value.ngWords];
  maxLength.value = aiConfig.value.maxLength;
  maxLengthInput.value = aiConfig.value.maxLength;
});

// NGワード追加
// 全角英数字を半角に変換する関数
function toHalfWidth(str: string): string {
  return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
  });
}

function normalizeWord(word: string): string {
  return toHalfWidth(word).toLowerCase().trim();
}

function addNgWord() {
  const word = newNgWord.value.trim();
  if (!word) return;
  const normalized = normalizeWord(word);
  const exists = ngWords.value.some((w: string) => normalizeWord(w) === normalized);
  if (!exists) {
    ngWords.value.push(word);
    newNgWord.value = "";
  }
}

// NGワード削除
function removeNgWord(idx: number) {
  ngWords.value.splice(idx, 1);
}

// 最大文字数更新（ローカル）
function updateMaxLength() {
  if (maxLengthInput.value > 0) {
    maxLength.value = maxLengthInput.value;
  }
}

// 保存処理（まとめてDB反映）
async function saveConfig() {
  errorMessage.value = "";
  aiConfig.value = {
    ngWords: [...ngWords.value],
    maxLength: maxLength.value,
  };

  await save();
  if (error.value) {
    errorMessage.value = error.value;
    return;
  }

  saveMessage.value = "保存しました";
  setTimeout(() => {
    saveMessage.value = "";
  }, 2000);
}
</script>

<style scoped>
.ai-config {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px 64px;
  background: #f9fafb;
}

h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
  letter-spacing: -0.01em;
}

h2:not(:first-child) {
  margin-top: 48px;
}

.max-length-input {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  margin-bottom: 16px;
}

.max-length-input input {
  width: 120px;
  height: 42px;
  padding: 0 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #1f2937;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.max-length-input input:hover {
  border-color: #9ca3af;
}

.max-length-input input:focus {
  outline: none;
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
}

.max-length-input button {
  min-width: 100px;
  padding: 11px 24px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  border: 1.5px solid #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
  background: #374151;
  color: #ffffff;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.08);
}

.max-length-input button:hover {
  background: #1f2937;
  border-color: #1f2937;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.15);
}

.max-length-input button:active {
  background: #111827;
}

.max-length-input span {
  font-size: 13px;
  color: #dc2626;
  font-weight: 500;
}

.ngword-input {
  display: flex;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  margin-bottom: 16px;
}

.ngword-input input {
  flex: 1;
  height: 42px;
  padding: 0 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #1f2937;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.ngword-input input:hover {
  border-color: #9ca3af;
}

.ngword-input input:focus {
  outline: none;
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
}

.ngword-input input::placeholder {
  color: #9ca3af;
}

.ngword-input button {
  min-width: 100px;
  padding: 11px 24px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  border: 1.5px solid #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
  background: #374151;
  color: #ffffff;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.08);
  flex-shrink: 0;
}

.ngword-input button:hover {
  background: #1f2937;
  border-color: #1f2937;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.15);
}

.ngword-input button:active {
  background: #111827;
}

.ngword-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  overflow: hidden;
}

.ngword-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #1f2937;
  transition: background-color 0.15s ease;
}

.ngword-list li:last-child {
  border-bottom: none;
}

.ngword-list li:hover {
  background: #f9fafb;
}

.ngword-list button {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #dc2626;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.ngword-list button:hover {
  background: #fecaca;
  border-color: #fca5a5;
  color: #b91c1c;
}

.ngword-list button:active {
  background: #fca5a5;
}

.save-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid #e5e7eb;
}

.save-section button {
  min-width: 140px;
  padding: 13px 32px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  border: 1.5px solid #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
  background: #374151;
  color: #ffffff;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.08);
}

.save-section button:hover:not(:disabled) {
  background: #1f2937;
  border-color: #1f2937;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.15);
}

.save-section button:active:not(:disabled) {
  background: #111827;
}

.save-section button:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

.save-section span {
  font-size: 14px;
  color: #059669;
  font-weight: 500;
}

.error {
  color: #dc2626 !important;
  background: #fee2e2;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #fecaca;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .ai-config {
    padding: 32px 16px 48px;
  }

  h2 {
    font-size: 18px;
    margin-bottom: 16px;
    padding-bottom: 10px;
  }

  h2:not(:first-child) {
    margin-top: 36px;
  }

  .max-length-input,
  .ngword-input {
    flex-direction: column;
    gap: 10px;
    padding: 16px;
  }

  .max-length-input input {
    width: 100%;
  }

  .ngword-input input,
  .ngword-input button,
  .max-length-input button {
    width: 100%;
  }

  .ngword-list li {
    padding: 12px 16px;
    font-size: 13px;
  }

  .save-section {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    margin-top: 36px;
    padding-top: 24px;
  }

  .save-section button {
    width: 100%;
  }

  .save-section span {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .ai-config {
    padding: 24px 12px 40px;
  }

  h2 {
    font-size: 16px;
  }

  .max-length-input,
  .ngword-input {
    padding: 14px;
  }

  .ngword-list li {
    padding: 10px 14px;
    font-size: 12px;
  }
}
</style>
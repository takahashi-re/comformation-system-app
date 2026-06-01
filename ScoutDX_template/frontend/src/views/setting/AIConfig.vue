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
  max-width: 400px;
  margin: 0 auto;
}
.ngword-input,
.max-length-input,
.save-section {
  margin-bottom: 16px;
}
.ngword-list {
  list-style: none;
  padding: 0;
}
.ngword-list li {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}
.ngword-list button {
  margin-left: 8px;
  color: red;
  border: none;
  background: none;
  cursor: pointer;
}
.max-length-input input {
  width: 80px;
  margin-right: 8px;
}
.save-section button {
  padding: 4px 16px;
}
.error {
  margin-left: 8px;
  color: #d32f2f;
}
</style>

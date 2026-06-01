<template>
  <div class="change-password-container">
    <h2>パスワード変更</h2>
    <form @submit.prevent="handleSubmit" class="form-box">
      <div class="form-row">
        <label for="currentPassword">現在のパスワード</label>
        <input
          id="currentPassword"
          type="password"
          v-model="currentPassword"
          autocomplete="current-password"
        />
      </div>

      <div class="form-row">
        <label for="newPassword">新しいパスワード</label>
        <input
          id="newPassword"
          type="password"
          v-model="newPassword"
          autocomplete="new-password"
        />
      </div>

      <div class="form-row">
        <label for="confirmPassword">新しいパスワード（確認）</label>
        <input
          id="confirmPassword"
          type="password"
          v-model="confirmPassword"
          autocomplete="new-password"
        />
      </div>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? "変更中..." : "パスワードを変更する" }}
      </button>

      <p v-if="message" :class="{ success: isSuccess, error: !isSuccess }">
        {{ message }}
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { changePasswordApi } from "../../api/loginApi";

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const message = ref("");
const isSuccess = ref(false);
const isSubmitting = ref(false);

const handleSubmit = async (): Promise<void> => {
  message.value = "";
  isSuccess.value = false;

  if (!currentPassword.value.trim() || !newPassword.value.trim() || !confirmPassword.value.trim()) {
    message.value = "全ての項目を入力してください";
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    message.value = "新しいパスワードが一致しません";
    return;
  }

  try {
    isSubmitting.value = true;
    await changePasswordApi(currentPassword.value, newPassword.value);
    message.value = "パスワードを変更しました";
    isSuccess.value = true;
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
  } catch (error: unknown) {
    message.value = error instanceof Error ? error.message : "パスワード変更に失敗しました";
    isSuccess.value = false;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.change-password-container {
  max-width: 420px;
  margin: 40px auto;
  padding: 24px;
  background: #ffffff;
  border: 1px solid #d6dbe3;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.04);
}

h2 {
  margin-bottom: 20px;
  color: #2b3a58;
  font-size: 1.4rem;
}

.form-box {
  display: grid;
  gap: 16px;
}

.form-row {
  display: grid;
  gap: 8px;
}

label {
  color: #36435a;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #c1c9d3;
  border-radius: 8px;
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #1f3c88;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

p.success {
  color: #1c7a3f;
}

p.error {
  color: #c62828;
}
</style>

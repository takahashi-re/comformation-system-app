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
  max-width: 480px;
  margin: 80px auto;
  padding: 40px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 4px 6px 0 rgb(0 0 0 / 0.1);
}

h2 {
  margin: 0 0 32px;
  color: #1f2937;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  letter-spacing: -0.02em;
}

.form-box {
  display: grid;
  gap: 20px;
}

.form-row {
  display: grid;
  gap: 8px;
}

label {
  color: #374151;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.01em;
}

input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #1f2937;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
  box-sizing: border-box;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

input:hover {
  border-color: #9ca3af;
}

input:focus {
  outline: none;
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
}

button {
  width: 100%;
  height: 48px;
  padding: 0 24px;
  margin-top: 12px;
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

button:hover:not(:disabled) {
  background: #1f2937;
  border-color: #1f2937;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.15);
}

button:active:not(:disabled) {
  background: #111827;
  transform: translateY(1px);
}

button:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

p {
  margin: 16px 0 0;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  text-align: center;
}

p.success {
  color: #059669;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
}

p.error {
  color: #dc2626;
  background: #fee2e2;
  border: 1px solid #fecaca;
}

@media (max-width: 768px) {
  .change-password-container {
    margin: 60px 16px;
    padding: 32px 24px;
  }

  h2 {
    font-size: 18px;
    margin-bottom: 28px;
  }

  .form-box {
    gap: 18px;
  }

  input {
    height: 42px;
    font-size: 13px;
  }

  button {
    height: 46px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .change-password-container {
    margin: 40px 12px;
    padding: 28px 20px;
  }

  h2 {
    font-size: 16px;
    margin-bottom: 24px;
  }

  label {
    font-size: 12px;
  }

  input {
    height: 40px;
    font-size: 13px;
  }

  button {
    height: 44px;
  }

  p {
    font-size: 12px;
    padding: 10px 14px;
  }
}
</style>
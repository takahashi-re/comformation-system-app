<template>
  <div class="login-container">
    <h2>ログイン</h2>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="employee_id">社員ID</label>
        <input
          id="employee_id"
          v-model="employeeId"
          type="text"
          placeholder="例: 0001"
        />
      </div>
      <div>
        <label for="password">パスワード</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="••••••••"
        />
      </div>
      <button type="submit">ログイン</button>
      <p v-if="store.error" class="message">{{ store.error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useLoginStore } from "../store/login.Store";

const employeeId = ref("");
const password = ref("");
const store = useLoginStore();

const handleLogin = async () => {
  const ok = await store.login(employeeId.value, password.value);
  if (ok) {
    window.location.href = "/";
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 2em;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #fff;
}
label {
  display: block;
  margin-bottom: 0.2em;
}
input {
  width: 100%;
  margin-bottom: 1em;
  padding: 0.5em;
  border: 1px solid #aaa;
  border-radius: 4px;
}
button {
  width: 100%;
  padding: 0.7em;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
}
.message {
  margin-top: 1em;
  color: #d32f2f;
}
</style>

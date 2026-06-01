<template>
  <div class="login-container">
    <h2>ログイン</h2>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="employee_id">社員ID</label>
        <input id="employee_id" v-model="employeeId" type="text" />
      </div>
      <div>
        <label for="password">パスワード</label>
        <input id="password" v-model="password" type="password" />
      </div>
      <button type="submit">ログイン</button>
      <p v-if="store.error" class="message">{{ store.error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useLoginStore } from "../../store/login.Store";
import { useRouter } from "vue-router";

const employeeId = ref("");
const password = ref("");
const store = useLoginStore();
const router = useRouter();

const handleLogin = async () => {
  const ok = await store.login(employeeId.value, password.value);
  if (ok) {
    router.push("/");
  }
};
</script>

<style scoped>
.login-container {
  max-width: 440px;
  margin: 80px auto;
  padding: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 4px 6px 0 rgb(0 0 0 / 0.1);
}

h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 32px;
  text-align: center;
  letter-spacing: -0.02em;
}

form > div {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
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

input::placeholder {
  color: #9ca3af;
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

button:hover {
  background: #1f2937;
  border-color: #1f2937;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.15);
}

button:active {
  background: #111827;
  transform: translateY(1px);
}

.message {
  margin-top: 16px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #dc2626;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  text-align: center;
}

@media (max-width: 768px) {
  .login-container {
    margin: 60px 16px;
    padding: 32px 24px;
  }

  h2 {
    font-size: 22px;
    margin-bottom: 28px;
  }

  form > div {
    margin-bottom: 18px;
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
  .login-container {
    margin: 40px 12px;
    padding: 28px 20px;
  }

  h2 {
    font-size: 20px;
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

  .message {
    font-size: 12px;
    padding: 10px 14px;
  }
}
</style>

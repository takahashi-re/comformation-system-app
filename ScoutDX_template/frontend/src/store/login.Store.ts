import { computed, ref } from "vue";
import { defineStore } from "pinia";
import {
  type LoginUser,
  loginApi,
  saveToken,
  saveUser,
  clearLogin,
  getToken,
  getUser,
} from "../api/loginApi";

export const useLoginStore = defineStore("login", () => {
  const access_token = ref<string>(getToken() || "");
  const user = ref<LoginUser | null>(getUser());
  const error = ref<string>("");
  const isLoggedIn = computed(() => access_token.value.length > 0);

  const login = async (
    employee_id: string,
    password: string,
  ): Promise<boolean> => {
    error.value = "";
    try {
      const data = await loginApi(employee_id, password);
      saveToken(data.access_token);
      saveUser(data.user);
      access_token.value = data.access_token;
      user.value = data.user;
      return true;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "ログインに失敗しました";
      return false;
    }
  };

  const logout = (): void => {
    clearLogin();
    access_token.value = "";
    user.value = null;
  };

  return {
    access_token,
    user,
    error,
    isLoggedIn,
    login,
    logout,
  };
});

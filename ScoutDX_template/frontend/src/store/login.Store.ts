import { computed, ref } from "vue";
import { defineStore } from "pinia";
import {
  type LoginUser,
  loginApi,
  getMeApi,
  logoutApi,
} from "../api/loginApi";

export const useLoginStore = defineStore("login", () => {
  // ✅ token を削除（Cookie で管理）
  const user = ref<LoginUser | null>(null);
  const error = ref<string>("");

  // ✅ user が存在するかどうかで判断
  const isLoggedIn = computed(() => user.value !== null);

  /**
   * ✅ ログイン処理
   * 1. POST /api/login (username, password)
   * 2. Cookie に session_token をセット
   * 3. GET /api/login/me で user 情報取得
   */
  const login = async (
    employee_id: string,
    password: string,
  ): Promise<boolean> => {
    error.value = "";
    try {
      // ✅ ステップ 1: ログイン（Cookie をセット）
      await loginApi(employee_id, password);

      // ✅ ステップ 2: ユーザー情報を取得
      const userData = await getMeApi();
      user.value = userData;

      return true;
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : "ログインに失敗しました";
      user.value = null;
      return false;
    }
  };

  /**
   * ✅ ログアウト処理
   * 1. POST /api/login/logout (Cookie 削除)
   * 2. ローカルの user をクリア
   */
  const logout = async (): Promise<void> => {
    try {
      await logoutApi();
    } catch (e: unknown) {
      console.error("ログアウト中にエラーが発生しました:", e);
    }
    user.value = null;
    error.value = "";
  };

  /**
   * ✅ ページ読み込み時にセッションが有効か確認
   * （リロード時に user 情報を復元）
   */
  const checkSession = async (): Promise<void> => {
    try {
      const userData = await getMeApi();
      user.value = userData;
    } catch (e: unknown) {
      user.value = null;
    }
  };

  return {
    user,
    error,
    isLoggedIn,
    login,
    logout,
    checkSession,
  };
});

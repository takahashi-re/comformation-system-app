import axios from "axios";
import { apiClient } from "./client";

export interface LoginUser {
  employee_id: string;
  name: string;
  position_id: number | null;
}

/**
 * Cookie セッションを発行するログイン
 */
export async function loginApi(
  employee_id: string,
  password: string,
): Promise<void> {
  if (!employee_id.trim() || !password.trim()) {
    throw new Error("employee_id と password は必須です");
  }

  try {
    await apiClient.post("/api/login", {
      employee_id,
      password,
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        (error.code === "ERR_NETWORK"
          ? "APIに接続できません。バックエンドが起動しているか確認してください"
          : "ログインに失敗しました");
      throw new Error(message);
    }
    throw new Error("ログインに失敗しました");
  }
}

export async function getMeApi(): Promise<LoginUser> {
  try {
    const { data } = await apiClient.get<LoginUser>("/api/login/me");
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        "ユーザー情報取得に失敗しました";
      throw new Error(message);
    }
    throw new Error("ユーザー情報取得に失敗しました");
  }
}

export async function logoutApi(): Promise<void> {
  try {
    await apiClient.post("/api/login/logout");
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("ログアウト中にエラーが発生しました:", error);
    }
  }
}

export async function changePasswordApi(
  old_password: string,
  new_password: string,
): Promise<void> {
  if (!old_password.trim() || !new_password.trim()) {
    throw new Error("現在のパスワードと新しいパスワードは必須です");
  }

  try {
    await apiClient.post("/api/login/change-password", {
      old_password,
      new_password,
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ||
        (error.code === "ERR_NETWORK"
          ? "APIに接続できません。バックエンドが起動しているか確認してください"
          : "パスワード変更に失敗しました");
      throw new Error(message);
    }
    throw new Error("パスワード変更に失敗しました");
  }
}

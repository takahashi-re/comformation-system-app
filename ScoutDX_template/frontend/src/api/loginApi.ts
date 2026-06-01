import axios from "axios";
import { apiClient } from "./client";

export interface LoginUser {
  employee_id: string;
  name: string;
  position_id: number | null;
}

export interface LoginResponse {
  access_token: string;
  user: LoginUser;
}

// ログインAPIラッパー
export async function loginApi(
  employee_id: string,
  password: string,
): Promise<LoginResponse> {
  if (!employee_id.trim() || !password.trim()) {
    throw new Error("employee_id と password は必須です");
  }

  try {
    const { data } = await apiClient.post<LoginResponse>("/api/login", {
      employee_id,
      password,
    });
    return data;
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

export function saveToken(token: string): void {
  localStorage.setItem("access_token", token);
}

export function saveUser(user: LoginUser): void {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem("access_token");
}

export function getUser(): LoginUser | null {
  const u = localStorage.getItem("user");
  return u ? (JSON.parse(u) as LoginUser) : null;
}

export function clearLogin(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}

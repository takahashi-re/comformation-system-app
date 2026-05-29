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

  const res = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ employee_id, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "ログインに失敗しました");
  }

  return (await res.json()) as LoginResponse;
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

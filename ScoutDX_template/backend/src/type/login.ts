export interface LoginRequest {
  employee_id: string;
  password: string;
}

export interface LoginSession {
  employee_id: string;
  name: string;
  position_id: number | null;
}

export interface LoginResponse {
  access_token: string;
  user: LoginSession;
}

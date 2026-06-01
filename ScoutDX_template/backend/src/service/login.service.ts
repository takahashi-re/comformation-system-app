import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { LoginRepository } from "../repository/login.repository";
import {
  LoginRequest,
  LoginResponse,
  LoginSession,
} from "../type/login";

@Injectable() // DIコンテナに登録するためのデコレーター
export class LoginService {
  private readonly sessionStore = new Map<string, LoginSession>(); // メモリ上のセッションストア（token -> session）

  constructor(private readonly loginRepository: LoginRepository) {}

  async login(body: LoginRequest): Promise<LoginResponse> {
    const rawEmployeeId = String(body?.employee_id ?? "").trim();
    const password = body?.password?.trim();

    if (!rawEmployeeId || !password) {
      throw new BadRequestException("employee_id と password は必須です");
    }

    const employee = await this.loginRepository.findByEmployeeIdAndPassword(
      rawEmployeeId,
      password,
    );

    if (!employee) {
      throw new UnauthorizedException(
        "employee_id または password が一致しません",
      );
    }

    const token = this.generateToken();
    const session: LoginSession = {
      employee_id: employee.employee_id,
      name: employee.name,
      position_id:
        employee.position_id !== null ? Number(employee.position_id) : null,
    };

    this.sessionStore.set(token, session);

    return { access_token: token, user: session };
  }

  async changePassword(
    sessionToken: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const session = this.getSessionByToken(sessionToken);
    if (!newPassword.trim()) {
      throw new BadRequestException("新しいパスワードは必須です");
    }

    const employee = await this.loginRepository.findByEmployeeIdAndPassword(
      session.employee_id,
      oldPassword,
    );
    if (!employee) {
      throw new UnauthorizedException("現在のパスワードが一致しません");
    }

    const updated = await this.loginRepository.updatePassword(
      session.employee_id,
      newPassword,
    );
    if (!updated) {
      throw new BadRequestException("パスワードを更新できませんでした");
    }
  }

  private generateToken(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  getSessionByToken(token: string): LoginSession {
    const session = this.sessionStore.get(token);
    if (!session) {
      throw new UnauthorizedException("ログインセッションが存在しません");
    }
    return session;
  }

  clearSession(token: string): void {
    this.sessionStore.delete(token);
  }
}

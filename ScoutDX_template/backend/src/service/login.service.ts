import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { LoginRepository } from "../repository/login.repository";
import { LoginRequest, LoginResponse, LoginSession } from "../type/login";

@Injectable()
export class LoginService {
  private readonly sessionStore = new Map<string, LoginSession>();

  constructor(private readonly loginRepository: LoginRepository) {}

  async login(body: LoginRequest): Promise<LoginResponse> {
    const rawEmployeeId = String(body?.employee_id ?? "").trim();
    const password = body?.password?.trim();

    if (!rawEmployeeId || !password) {
      throw new BadRequestException("employee_id と password は必須です");
    }

    if (!/^\d+$/.test(rawEmployeeId)) {
      throw new BadRequestException(
        "employee_id は数値文字列で指定してください",
      );
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
      employee_id: String(employee.employee_id),
      position_id:
        employee.position_id !== null ? Number(employee.position_id) : null,
    };

    this.sessionStore.set(token, session);

    return {
      access_token: token,
      user: session,
    };
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
}

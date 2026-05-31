import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response } from "express";
import {
  ChangePasswordRequest,
  LoginRequest,
  LoginSession,
} from "../type/login";
import { LoginService } from "../service/login.service";

@Controller("api/login")
export class LoginController {
  private readonly SESSION_COOKIE_NAME = "session_token";
  private readonly COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 1日（ミリ秒）

  constructor(private readonly loginService: LoginService) {}

  /**
   * ✅ ログイン - HttpOnly Cookie にセッション token をセット
   * リクエスト: POST /api/login { employee_id, password }
   * レスポンス: 200 OK (Cookie に session_token をセット、ボディは空)
   */
  @Post()
  @HttpCode(200)
  async login(
    @Body() body: LoginRequest, // { employee_id, password }
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    // ログイン処理（セッション情報を取得）
    const session = await this.loginService.login(body);

    // ✅ HttpOnly Cookie にセッション token をセット
    response.cookie(this.SESSION_COOKIE_NAME, session.access_token, {
      httpOnly: true,
      secure: false, // ローカル開発用（本番環境では true に）
      sameSite: "strict",
      maxAge: this.COOKIE_MAX_AGE, // token の有効期限を設定
      path: "/", // Cookie の有効パスをルートに設定（全てのパスで有効）
    });
  }

  /**
   * ✅ ユーザー情報取得 - Cookie から session_token を読み取り
   * リクエスト: GET /api/login/me (Cookie に session_token)
   * レスポンス: 200 OK { user: LoginSession }
   */
  @Get("me")
  getMe(
    @Req() request: Request,
  ): LoginSession {
    const sessionToken = request.cookies?.[this.SESSION_COOKIE_NAME];
    if (!sessionToken) {
      throw new UnauthorizedException(
        "ログインセッションが存在しません",
      );
    }

    return this.loginService.getSessionByToken(sessionToken);
  }

  /**
   * ログアウト - Cookie を削除
   * リクエスト: POST /api/login/logout
   * レスポンス: 204 No Content (Cookie を削除)
   */
  @Post("change-password")
  @HttpCode(204)
  async changePassword(
    @Req() request: Request,
    @Body() body: ChangePasswordRequest,
  ): Promise<void> {
    const sessionToken = request.cookies?.[this.SESSION_COOKIE_NAME];
    if (!sessionToken) {
      throw new UnauthorizedException("ログインセッションが存在しません");
    }

    const { old_password, new_password } = body ?? {};
    if (!old_password?.trim() || !new_password?.trim()) {
      throw new BadRequestException(
        "現在のパスワードと新しいパスワードは必須です",
      );
    }

    await this.loginService.changePassword(
      sessionToken,
      old_password,
      new_password,
    );
  }

  @Post("logout")
  @HttpCode(204)
  logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): void {
    const sessionToken = request.cookies?.[this.SESSION_COOKIE_NAME];
    // セッションをメモリから削除
    if (sessionToken) {
      this.loginService.clearSession(sessionToken);
    }

    // Cookie を削除（maxAge: 0 で即座に削除）
    response.clearCookie(this.SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
    });
  }
}

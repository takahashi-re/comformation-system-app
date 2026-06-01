import {
  Body, //リクエストボディ(jsonファイル)を受け取るためのデコレーター
  Controller,
  Get,
  Headers, //リクエストヘッダーを受け取るためのデコレーター
  Post,
  UnauthorizedException, //認証エラーを表す例外クラス
} from "@nestjs/common";
import { LoginRequest, LoginResponse, LoginSession } from "../type/login";
import { LoginService } from "../service/login.service";

@Controller("api/login")
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    return this.loginService.login(body);
  }

  @Get("me")
  getMe(@Headers("authorization") authorization?: string): LoginSession {
    // AuthorizationヘッダーからBearerトークンを抽出してセッション情報を取得する
    const token = this.extractBearerToken(authorization);
    return this.loginService.getSessionByToken(token);
  }

  private extractBearerToken(authorization?: string): string {
    if (!authorization) {
      throw new UnauthorizedException("認証トークンがありません");
    }

    const [scheme, token] = authorization.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedException("認証ヘッダーの形式が不正です");
    }

    return token;
  }
}

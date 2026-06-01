import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { LoginService } from '../service/login.service';
import { ScoutService } from '../service/scout.service';

@Controller('api/return-comment-genres')
export class ReturnCommentGenreController {
  private readonly SESSION_COOKIE_NAME = 'session_token';

  constructor(
    private readonly scoutService: ScoutService,
    private readonly loginService: LoginService,
  ) {}

  private getCurrentPositionId(request: Request): number {
    const sessionToken = request.cookies?.[this.SESSION_COOKIE_NAME];
    if (!sessionToken) {
      throw new UnauthorizedException('ログインセッションが存在しません');
    }

    const session = this.loginService.getSessionByToken(sessionToken);
    const positionId = Number(session.position_id ?? 0);
    if (!Number.isFinite(positionId) || positionId <= 0) {
      throw new BadRequestException('ロール情報を取得できません');
    }

    return positionId;
  }

  @Get()
  async findMine(@Req() request: Request) {
    const positionId = this.getCurrentPositionId(request);
    return this.scoutService.getGenresForPosition(positionId);
  }

  @Post()
  async addMine(
    @Req() request: Request,
    @Body() body: { name?: string },
  ) {
    const positionId = this.getCurrentPositionId(request);
    return this.scoutService.addGenreForPosition(positionId, String(body?.name ?? ''));
  }

  @Delete(':genreId')
  async deleteMine(
    @Req() request: Request,
    @Param('genreId') genreId: string,
  ) {
    const positionId = this.getCurrentPositionId(request);
    return this.scoutService.deleteGenreForPosition(positionId, Number(genreId));
  }
}

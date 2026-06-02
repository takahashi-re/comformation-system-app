import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AiGenerateService } from '../service/ai-generate.service';
import { LoginService } from '../service/login.service';

interface JobInfo {
  companyName: string;
  jobTitle: string;
  businessContent: string;
  requiredSkills: string;
  location: string;
  minSalary: number;
  maxSalary: number;
  appealPoints: string;
}

interface ApplicantInfo {
  gender: string;
  age: number | null;
  desiredJobTitle: string;
  aiInstructions: string;
}

interface GenerateRequest {
  jobInfo: JobInfo;
  applicantInfo: ApplicantInfo;
  textStyle?: 'casual' | 'formal';
  createdByEmployeeId?: string;
}

@Controller('api/ai')
export class AiGenerateController {
  private readonly SESSION_COOKIE_NAME = 'session_token';

  constructor(
    private readonly aiGenerateService: AiGenerateService,
    private readonly loginService: LoginService,
  ) {}

  private resolveCurrentEmployeeId(request: Request): string {
    const sessionToken = request.cookies?.[this.SESSION_COOKIE_NAME];
    if (!sessionToken) {
      throw new UnauthorizedException('ログインセッションが存在しません');
    }

    const session = this.loginService.getSessionByToken(sessionToken);
    const employeeId = String(session.employee_id ?? '').trim();
    if (!employeeId) {
      throw new UnauthorizedException('ユーザー情報を取得できません');
    }

    return employeeId;
  }

  @Get('generate')
  generate() {
    return this.aiGenerateService.getSample();
  }

  @Post('generate')
  async generateFromForm(@Req() request: Request, @Body() body: GenerateRequest) {
    const createdByEmployeeId = this.resolveCurrentEmployeeId(request);
    const result = await this.aiGenerateService.generateFromForm({
      ...body,
      createdByEmployeeId,
    });
    return { body: result.body, scoutId: result.scoutId };
  }
}

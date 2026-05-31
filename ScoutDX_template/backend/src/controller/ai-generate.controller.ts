import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiGenerateService } from '../service/ai-generate.service';

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
}

@Controller('api/ai')
export class AiGenerateController {
  constructor(private readonly aiGenerateService: AiGenerateService) {}

  @Get('generate')
  generate() {
    return this.aiGenerateService.getSample();
  }

  @Post('generate')
  async generateFromForm(@Body() body: GenerateRequest) {
    const result = await this.aiGenerateService.generateFromForm(body);
    return { body: result.body, scoutId: result.scoutId };
  }
}

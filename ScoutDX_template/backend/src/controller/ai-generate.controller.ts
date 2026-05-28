import { Body, Controller, Get, Post } from '@nestjs/common';
import { AiGenerateService } from '../service/ai-generate.service';

interface JobInfo {
  companyName: string;
  jobTitle: string;
  businessContent: string;
  requiredSkills: string;
  location: string;
  salary: number;
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
  textStyle?: string;
}

@Controller('api/ai')
export class AiGenerateController {
  constructor(private readonly aiGenerateService: AiGenerateService) {}

  @Get('generate')
  generate() {
    return this.aiGenerateService.getSample();
  }

  @Post('generate')
  generateFromForm(@Body() body: GenerateRequest) {
    return this.aiGenerateService.generateFromForm(body);
  }
}

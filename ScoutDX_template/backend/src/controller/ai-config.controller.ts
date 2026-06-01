import { Controller, Get, Post, Body } from '@nestjs/common';
import { AIConfigService } from '../service/ai-config.service';
import { AIConfig } from '../type/ai-config';

@Controller('api/ai-config')
export class AIConfigController {
  constructor(private readonly service: AIConfigService) {}

  @Get()
  async getConfig(): Promise<AIConfig> {
    return this.service.getConfig();
  }

  @Post()
  async saveConfig(@Body() config: AIConfig): Promise<void> {
    await this.service.saveConfig(config);
  }
}

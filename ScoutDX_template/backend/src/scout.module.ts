import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AiGenerateController } from "./controller/ai-generate.controller";
import { AIConfigController } from "./controller/ai-config.controller";
import { LoginController } from "./controller/login.controller";
import { ScoutController } from "./controller/scout.controller";
import { LoginRepository } from "./repository/login.repository";
import { JobPostingRepository } from "./repository/job-posting.repository";
import { JobSeekerRepository } from "./repository/job-seeker.repository";
import { ScoutMessageRepository } from "./repository/scout-message.repository";
import { AiGenerateService } from "./service/ai-generate.service";
import { AIConfigService } from "./service/ai-config.service";
import { LoginService } from "./service/login.service";
import { AIConfigRepository } from "./repository/ai-config.repository";
import { ScoutService } from "./service/scout.service";
import { ScoutMessageEntity } from "./type/scout-message";
import { ScoutEntity } from "./type/scout";

@Module({
  imports: [TypeOrmModule.forFeature([ScoutEntity, ScoutMessageEntity])],
  controllers: [ScoutController, AiGenerateController, LoginController, AIConfigController],
  providers: [
    ScoutService,
    ScoutMessageRepository,
    AiGenerateService,
    LoginService,
    LoginRepository,
    JobPostingRepository,
    JobSeekerRepository,
    AIConfigService,
    AIConfigRepository,
  ],
})
export class ScoutModule {}

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AiGenerateController } from "./controller/ai-generate.controller";
import { LoginController } from "./controller/login.controller";
import { ScoutController } from "./controller/scout.controller";
import { LoginRepository } from "./repository/login.repository";
import { ScoutRepository } from "./repository/scout.repository";
import { AiGenerateService } from "./service/ai-generate.service";
import { LoginService } from "./service/login.service";
import { ScoutService } from "./service/scout.service";
import { ScoutEntity } from "./type/scout";

@Module({
  imports: [TypeOrmModule.forFeature([ScoutEntity])],
  controllers: [ScoutController, AiGenerateController, LoginController],
  providers: [
    ScoutService,
    ScoutRepository,
    AiGenerateService,
    LoginService,
    LoginRepository,
  ],
})
export class ScoutModule {}

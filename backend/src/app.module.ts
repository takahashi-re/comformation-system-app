import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { HealthController } from "./health.controller";
import { ScoutDocumentsModule } from "./scout-documents/scout-documents.module";

@Module({
  imports: [DatabaseModule, ScoutDocumentsModule],
  controllers: [HealthController],
})
export class AppModule {}

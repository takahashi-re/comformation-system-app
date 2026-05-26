import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { ScoutDocumentsController } from "./scout-documents.controller";
import { ScoutDocumentsService } from "./scout-documents.service";

@Module({
  imports: [DatabaseModule],
  controllers: [ScoutDocumentsController],
  providers: [ScoutDocumentsService],
})
export class ScoutDocumentsModule {}

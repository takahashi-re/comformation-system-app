import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import type { ScoutDocument } from "../types";
import { CreateScoutDocumentDto } from "./dto/create-scout-document.dto";
import { DecideScoutDocumentDto } from "./dto/decide-scout-document.dto";
import { ScoutDocumentsService } from "./scout-documents.service";

@Controller("/api/scout-documents")
export class ScoutDocumentsController {
  constructor(private readonly scoutDocumentsService: ScoutDocumentsService) {}

  @Get()
  list(): Promise<ScoutDocument[]> {
    return this.scoutDocumentsService.list();
  }

  @Post()
  create(@Body() body: CreateScoutDocumentDto): Promise<ScoutDocument> {
    return this.scoutDocumentsService.create(body);
  }

  @Patch(":id/decision")
  decide(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: DecideScoutDocumentDto,
  ): Promise<ScoutDocument> {
    return this.scoutDocumentsService.decide(id, body);
  }
}

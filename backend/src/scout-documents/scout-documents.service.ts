import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { SCOUT_DOCUMENT_STORE } from "../database/database.constants";
import type { ScoutDocumentStore } from "../store";
import type {
  CreateScoutDocumentInput,
  DecideScoutDocumentInput,
  ScoutDocument,
} from "../types";

@Injectable()
export class ScoutDocumentsService {
  constructor(
    @Inject(SCOUT_DOCUMENT_STORE) private readonly store: ScoutDocumentStore,
  ) {}

  list(): Promise<ScoutDocument[]> {
    return this.store.list();
  }

  create(input: CreateScoutDocumentInput): Promise<ScoutDocument> {
    return this.store.create(input);
  }

  async decide(
    id: number,
    input: DecideScoutDocumentInput,
  ): Promise<ScoutDocument> {
    const updatedDocument = await this.store.decide(id, input);

    if (!updatedDocument) {
      throw new NotFoundException("Scout document not found");
    }

    return updatedDocument;
  }
}

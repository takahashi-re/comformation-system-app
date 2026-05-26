import type { CreateScoutDocumentInput, DecideScoutDocumentInput, ScoutDocument } from './types'

export interface ScoutDocumentStore {
  list(): Promise<ScoutDocument[]>
  create(input: CreateScoutDocumentInput): Promise<ScoutDocument>
  decide(id: number, input: DecideScoutDocumentInput): Promise<ScoutDocument | null>
}

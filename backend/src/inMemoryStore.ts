import type { CreateScoutDocumentInput, DecideScoutDocumentInput, ScoutDocument } from './types'
import type { ScoutDocumentStore } from './store'

export class InMemoryScoutDocumentStore implements ScoutDocumentStore {
  private documents: ScoutDocument[] = []
  private nextId = 1

  async list(): Promise<ScoutDocument[]> {
    return [...this.documents].sort((left, right) => right.id - left.id)
  }

  async create(input: CreateScoutDocumentInput): Promise<ScoutDocument> {
    const timestamp = new Date().toISOString()
    const document: ScoutDocument = {
      id: this.nextId++,
      candidateName: input.candidateName,
      scoutTitle: input.scoutTitle,
      scoutBody: input.scoutBody,
      status: 'pending',
      createdBy: input.createdBy,
      decisionComment: null,
      decidedBy: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    this.documents.unshift(document)
    return document
  }

  async decide(id: number, input: DecideScoutDocumentInput): Promise<ScoutDocument | null> {
    const target = this.documents.find((document) => document.id === id)

    if (!target) {
      return null
    }

    target.status = input.action === 'approve' ? 'approved' : 'returned'
    target.decisionComment = input.comment?.trim() || null
    target.decidedBy = input.decidedBy
    target.updatedAt = new Date().toISOString()

    return target
  }
}

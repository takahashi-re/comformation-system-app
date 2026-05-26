export type ScoutDocumentStatus = 'pending' | 'approved' | 'returned'

export interface ScoutDocument {
  id: number
  candidateName: string
  scoutTitle: string
  scoutBody: string
  status: ScoutDocumentStatus
  createdBy: string
  decisionComment: string | null
  decidedBy: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateScoutDocumentPayload {
  candidateName: string
  scoutTitle: string
  scoutBody: string
  createdBy: string
}

export interface DecideScoutDocumentPayload {
  action: 'approve' | 'return'
  comment: string
  decidedBy: string
}

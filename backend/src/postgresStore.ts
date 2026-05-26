import { Pool } from 'pg'
import type { ScoutDocumentStore } from './store'
import type { CreateScoutDocumentInput, DecideScoutDocumentInput, ScoutDocument } from './types'

const schemaSql = `
  CREATE TABLE IF NOT EXISTS scout_documents (
    id SERIAL PRIMARY KEY,
    candidate_name TEXT NOT NULL,
    scout_title TEXT NOT NULL,
    scout_body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_by TEXT NOT NULL,
    decision_comment TEXT,
    decided_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`

const mapRow = (row: Record<string, string | number | null>): ScoutDocument => ({
  id: Number(row.id),
  candidateName: String(row.candidate_name),
  scoutTitle: String(row.scout_title),
  scoutBody: String(row.scout_body),
  status: row.status as ScoutDocument['status'],
  createdBy: String(row.created_by),
  decisionComment: row.decision_comment ? String(row.decision_comment) : null,
  decidedBy: row.decided_by ? String(row.decided_by) : null,
  createdAt: new Date(String(row.created_at)).toISOString(),
  updatedAt: new Date(String(row.updated_at)).toISOString(),
})

export class PostgresScoutDocumentStore implements ScoutDocumentStore {
  constructor(private readonly pool: Pool) {}

  async initialize(): Promise<void> {
    await this.pool.query(schemaSql)
  }

  async list(): Promise<ScoutDocument[]> {
    const result = await this.pool.query('SELECT * FROM scout_documents ORDER BY created_at DESC, id DESC')
    return result.rows.map(mapRow)
  }

  async create(input: CreateScoutDocumentInput): Promise<ScoutDocument> {
    const result = await this.pool.query(
      `
        INSERT INTO scout_documents (candidate_name, scout_title, scout_body, status, created_by)
        VALUES ($1, $2, $3, 'pending', $4)
        RETURNING *
      `,
      [input.candidateName, input.scoutTitle, input.scoutBody, input.createdBy],
    )

    return mapRow(result.rows[0])
  }

  async decide(id: number, input: DecideScoutDocumentInput): Promise<ScoutDocument | null> {
    const status = input.action === 'approve' ? 'approved' : 'returned'
    const result = await this.pool.query(
      `
        UPDATE scout_documents
        SET status = $2,
            decision_comment = $3,
            decided_by = $4,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `,
      [id, status, input.comment?.trim() || null, input.decidedBy],
    )

    return result.rows[0] ? mapRow(result.rows[0]) : null
  }
}

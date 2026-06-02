import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

export interface JobTypeRow {
  job_type_id: number;
  job_type_name: string;
}

@Injectable()
export class JobTypeRepository {
  constructor(private readonly dataSource: DataSource) {}

  private async syncPrimaryKeySequence(): Promise<void> {
    await this.dataSource.query(`
      SELECT setval(
        pg_get_serial_sequence('job_types', 'job_type_id'),
        COALESCE((SELECT MAX(job_type_id) FROM job_types), 0) + 1,
        false
      )
    `);
  }

  async findByName(name: string): Promise<JobTypeRow | null> {
    if (!name) return null;
    const rows = await this.dataSource.query(
      `SELECT job_type_id, job_type_name FROM JOB_TYPES WHERE LOWER(TRIM(job_type_name)) = LOWER(TRIM($1)) LIMIT 1`,
      [name],
    );
    return rows[0] ?? null;
  }

  async create(name: string): Promise<JobTypeRow> {
    await this.syncPrimaryKeySequence();
    const rows = await this.dataSource.query(
      `INSERT INTO JOB_TYPES (job_type_name) VALUES ($1) RETURNING job_type_id, job_type_name`,
      [name],
    );
    return rows[0];
  }

  async findOrCreateByName(name: string): Promise<JobTypeRow> {
    const found = await this.findByName(name);
    if (found) return found;
    try {
      return await this.create(name);
    } catch (err: any) {
      // 競合時は再取得
      if (err?.code === "23505") {
        const retry = await this.findByName(name);
        if (retry) return retry;
      }
      throw err;
    }
  }

  async linkJobPosting(jobPostingId: number, jobTypeId: number): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO JOB_POSTING_JOB_TYPES (job_posting_id, job_type_id) VALUES ($1, $2) ON CONFLICT (job_posting_id, job_type_id) DO NOTHING`,
      [jobPostingId, jobTypeId],
    );
  }

  async linkJobSeeker(jobSeekerId: number, jobTypeId: number): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO JOB_SEEKER_JOB_TYPES (job_seeker_id, job_type_id) VALUES ($1, $2) ON CONFLICT (job_seeker_id, job_type_id) DO NOTHING`,
      [jobSeekerId, jobTypeId],
    );
  }

  async linkMultipleToJobPosting(jobPostingId: number, names: string[]): Promise<void> {
    for (const n of names) {
      const jt = await this.findOrCreateByName(n.trim());
      await this.linkJobPosting(jobPostingId, Number(jt.job_type_id));
    }
  }

  async linkMultipleToJobSeeker(jobSeekerId: number, names: string[]): Promise<void> {
    for (const n of names) {
      const jt = await this.findOrCreateByName(n.trim());
      await this.linkJobSeeker(jobSeekerId, Number(jt.job_type_id));
    }
  }
}
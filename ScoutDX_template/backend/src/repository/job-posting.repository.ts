import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

export interface JobPostingRow {
  job_posting_id: number;
  company_name: string;
  job_description: string | null;
  min_salary: number | null;
  max_salary: number | null;
  required_skills: string | null;
  job_appeal: string | null;
  work_location: string | null;
}

export interface CreateJobPostingInput {
  company_name: string;
  job_description?: string | null;
  min_salary?: number | null;
  max_salary?: number | null;
  required_skills?: string | null;
  job_appeal?: string | null;
  work_location?: string | null;
}

export interface JobTypeRow {
  job_type_id: number;
  job_type_name: string;
}

@Injectable()
export class JobPostingRepository {
  constructor(private readonly dataSource: DataSource) {}

  private async syncPrimaryKeySequence(): Promise<void> {
    await this.dataSource.query(`
      SELECT setval(
        pg_get_serial_sequence('job_postings', 'job_posting_id'),
        COALESCE((SELECT MAX(job_posting_id) FROM job_postings), 0) + 1,
        false
      )
    `);
  }

  private async syncJobTypesSequence(): Promise<void> {
    await this.dataSource.query(`
      SELECT setval(
        pg_get_serial_sequence('job_types', 'job_type_id'),
        COALESCE((SELECT MAX(job_type_id) FROM job_types), 0) + 1,
        false
      )
    `);
  }

  async create(input: CreateJobPostingInput): Promise<JobPostingRow> {
    await this.syncPrimaryKeySequence();

    const rows = await this.dataSource.query(
      `
        INSERT INTO JOB_POSTINGS (
          company_name,
          job_description,
          min_salary,
          max_salary,
          required_skills,
          job_appeal,
          work_location
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
          job_posting_id,
          company_name,
          job_description,
          min_salary,
          max_salary,
          required_skills,
          job_appeal,
          work_location
      `,
      [
        input.company_name,
        input.job_description ?? null,
        input.min_salary ?? null,
        input.max_salary ?? null,
        input.required_skills ?? null,
        input.job_appeal ?? null,
        input.work_location ?? null,
      ],
    );

    return rows[0];
  }

  async findAll(): Promise<JobPostingRow[]> {
    return this.dataSource.query(`
      SELECT
        job_posting_id,
        company_name,
        job_description,
        min_salary,
        max_salary,
        required_skills,
        job_appeal,
        work_location
      FROM JOB_POSTINGS
      ORDER BY job_posting_id DESC
    `);
  }

  async findById(jobPostingId: number): Promise<JobPostingRow | null> {
    const rows = await this.dataSource.query(
      `
        SELECT
          job_posting_id,
          company_name,
          job_description,
          min_salary,
          max_salary,
          required_skills,
          job_appeal,
          work_location
        FROM JOB_POSTINGS
        WHERE job_posting_id = $1
        LIMIT 1
      `,
      [jobPostingId],
    );

    if (!rows.length) {
      return null;
    }

    return rows[0];
  }





  async linkJobPostingToJobType(
    jobPostingId: number,
    jobTypeId: number,
  ): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO JOB_POSTING_JOB_TYPES (job_posting_id, job_type_id) VALUES ($1, $2) ON CONFLICT (job_posting_id, job_type_id) DO NOTHING`,
      [jobPostingId, jobTypeId],
    );
  }
}

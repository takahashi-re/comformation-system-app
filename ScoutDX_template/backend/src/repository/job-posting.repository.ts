import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

export interface JobPostingRow {
  job_posting_id: number;
  company_name: string;
  job_title: string;
  job_description: string | null;
  min_salary: number | null;
  max_salary: number | null;
  required_skills: string | null;
  job_appeal: string | null;
  work_location: string | null;
}

export interface CreateJobPostingInput {
  company_name: string;
  job_title: string;
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
          job_title,
          job_description,
          min_salary,
          max_salary,
          required_skills,
          job_appeal,
          work_location
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
          job_posting_id,
          company_name,
          job_title,
          job_description,
          min_salary,
          max_salary,
          required_skills,
          job_appeal,
          work_location
      `,
      [
        input.company_name,
        input.job_title,
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
        job_title,
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
          job_title,
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

  async findByTitle(jobTitle: string): Promise<JobPostingRow | null> {
    if (!jobTitle) return null;
    const rows = await this.dataSource.query(
      `
        SELECT
          job_posting_id,
          company_name,
          job_title,
          job_description,
          min_salary,
          max_salary,
          required_skills,
          job_appeal,
          work_location
        FROM JOB_POSTINGS
        WHERE LOWER(TRIM(job_title)) = LOWER(TRIM($1))
        LIMIT 1
      `,
      [jobTitle],
    );
    return rows[0] ?? null;
  }

  async createOrFindByTitle(
    input: CreateJobPostingInput,
  ): Promise<JobPostingRow> {
    // 既存検索
    const existing = await this.findByTitle(input.job_title);
    if (existing) return existing;

    // 新規挿入（競合が起きたら既存を返す）
    try {
      await this.syncPrimaryKeySequence();
      const rows = await this.dataSource.query(
        `
          INSERT INTO JOB_POSTINGS (
            company_name,
            job_title,
            job_description,
            min_salary,
            max_salary,
            required_skills,
            job_appeal,
            work_location
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          RETURNING
            job_posting_id,
            company_name,
            job_title,
            job_description,
            min_salary,
            max_salary,
            required_skills,
            job_appeal,
            work_location
        `,
        [
          input.company_name,
          input.job_title,
          input.job_description ?? null,
          input.min_salary ?? null,
          input.max_salary ?? null,
          input.required_skills ?? null,
          input.job_appeal ?? null,
          input.work_location ?? null,
        ],
      );
      return rows[0];
    } catch (err: any) {
      // Postgres の一意制約違反コード 23505 を検知したら既存を返す
      if (err?.code === "23505") {
        const found = await this.findByTitle(input.job_title);
        if (found) return found;
      }
      throw err;
    }
  }

  async findJobTypeByName(
    name: string,
  ): Promise<{ job_type_id: number; job_type_name: string } | null> {
    if (!name?.trim()) return null;
    const rows = await this.dataSource.query(
      `SELECT job_type_id, job_type_name FROM JOB_TYPES WHERE LOWER(TRIM(job_type_name)) = LOWER(TRIM($1)) LIMIT 1`,
      [name],
    );
    return rows[0] ?? null;
  }

  async createJobType(
    name: string,
  ): Promise<{ job_type_id: number; job_type_name: string }> {
    await this.syncJobTypesSequence();
    const rows = await this.dataSource.query(
      `INSERT INTO JOB_TYPES (job_type_name) VALUES ($1) RETURNING job_type_id, job_type_name`,
      [name],
    );
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

  async linkJobPostingToTitle(
    jobPostingId: number,
    title: string,
  ): Promise<void> {
    const name = title?.trim();
    if (!name) return;
    let jt = await this.findJobTypeByName(name);
    if (!jt) {
      // 存在しなければ作成して取得（衝突は稀だが再取得して安全側に）
      try {
        jt = await this.createJobType(name);
      } catch (err: any) {
        // 同名が別プロセスで作成された可能性 -> 再取得
        jt = await this.findJobTypeByName(name);
        if (!jt) throw err;
      }
    }
    await this.linkJobPostingToJobType(jobPostingId, Number(jt.job_type_id));
  }
}

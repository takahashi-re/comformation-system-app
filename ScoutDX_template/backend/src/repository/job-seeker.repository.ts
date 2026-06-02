import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

export interface JobSeekerRow {
  job_seeker_id: number;
  age: number;
  gender: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateJobSeekerInput {
  age: number;
  gender: string;
}

@Injectable()
export class JobSeekerRepository {
  constructor(private readonly dataSource: DataSource) {}

  private async syncPrimaryKeySequence(): Promise<void> {
    await this.dataSource.query(`
      SELECT setval(
        pg_get_serial_sequence('job_seekers', 'job_seeker_id'),
        COALESCE((SELECT MAX(job_seeker_id) FROM job_seekers), 0) + 1,
        false
      )
    `);
  }

  async create(input: CreateJobSeekerInput): Promise<JobSeekerRow> {
    await this.syncPrimaryKeySequence();

    const rows = await this.dataSource.query(
      `
        INSERT INTO JOB_SEEKERS (
          age,
          gender,
          created_at,
          updated_at
        )
        VALUES ($1, $2, NOW(), NOW())
        RETURNING
          job_seeker_id,
          age,
          gender,
          created_at,
          updated_at
      `,
      [input.age, input.gender],
    );

    return rows[0];
  }

  async findById(jobSeekerId: number): Promise<JobSeekerRow | null> {
    const rows = await this.dataSource.query(
      `
        SELECT
          job_seeker_id,
          age,
          gender,
          created_at,
          updated_at
        FROM JOB_SEEKERS
        WHERE job_seeker_id = $1
        LIMIT 1
      `,
      [jobSeekerId],
    );

    if (!rows.length) {
      return null;
    }

    return rows[0];
  }
}

import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

export interface JobSeekerRow {
  job_seeker_id: number;
  age: number;
  gender: string;
  desired_position: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateJobSeekerInput {
  age: number;
  gender: string;
  desired_position?: string | null;
}

@Injectable()
export class JobSeekerRepository {
  constructor(private readonly dataSource: DataSource) {}

  async create(input: CreateJobSeekerInput): Promise<JobSeekerRow> {
    const rows = await this.dataSource.query(
      `
        INSERT INTO JOB_SEEKERS (
          age,
          gender,
          desired_position,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING
          job_seeker_id,
          age,
          gender,
          desired_position,
          created_at,
          updated_at
      `,
      [input.age, input.gender, input.desired_position ?? null],
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
          desired_position,
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

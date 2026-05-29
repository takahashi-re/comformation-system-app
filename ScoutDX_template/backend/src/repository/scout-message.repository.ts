import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

export interface ScoutMessageRow {
  scout_message_id: number;
  message_content: string | null;
  sent_at: string | null;
  job_posting_id: number | null;
  job_seeker_id: number | null;
  created_by_employee_id: string | null;
  updated_by_employee_id: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ScoutMessageWithRelationsRow extends ScoutMessageRow {
  company_name: string | null;
  job_title: string | null;
  job_seeker_age: number | null;
  job_seeker_gender: string | null;
  desired_position: string | null;
}

export interface RejectScoutMessageInput {
  scout_message_id: number;
  return_comment: string;
  returned_by_employee_id?: string | null;
  genre_ids?: number[];
  next_message_content?: string | null;
  next_status?: string | null;
}

export interface CreateScoutMessageInput {
  message_content: string;
  job_posting_id: number;
  job_seeker_id: number;
  created_by_employee_id?: string | null;
  status?: string | null;
}

@Injectable()
export class ScoutMessageRepository {
  constructor(private readonly dataSource: DataSource) {}

  // Compatibility methods used by ScoutService.
  async findAll(): Promise<any[]> {
    return this.dataSource.query(
      `
        SELECT
          scout_message_id::text AS id,
          created_at,
          COALESCE(created_by_employee_id, '') AS creator,
          '' AS title,
          COALESCE(message_content, '') AS body,
          COALESCE(status, 'DRAFT') AS status
        FROM SCOUT_MESSAGES
        ORDER BY created_at DESC NULLS LAST, scout_message_id DESC
      `,
    );
  }

  async save(scout: any): Promise<any> {
    const rows = await this.dataSource.query(
      `
        INSERT INTO SCOUT_MESSAGES (
          message_content,
          created_by_employee_id,
          updated_by_employee_id,
          status,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $2, $3, NOW(), NOW())
        RETURNING
          scout_message_id::text AS id,
          created_at,
          COALESCE(created_by_employee_id, '') AS creator,
          '' AS title,
          COALESCE(message_content, '') AS body,
          COALESCE(status, 'DRAFT') AS status
      `,
      [scout?.body ?? '', scout?.creator ?? null, scout?.status ?? 'DRAFT'],
    );

    return rows[0];
  }

  async findById(id: string): Promise<any | null> {
    const rows = await this.dataSource.query(
      `
        SELECT
          scout_message_id::text AS id,
          created_at,
          COALESCE(created_by_employee_id, '') AS creator,
          '' AS title,
          COALESCE(message_content, '') AS body,
          COALESCE(status, 'DRAFT') AS status
        FROM SCOUT_MESSAGES
        WHERE scout_message_id = $1
        LIMIT 1
      `,
      [Number(id)],
    );

    return rows[0] ?? null;
  }

  async updateScout(id: string, body: string, status: string): Promise<any | null> {
    const rows = await this.dataSource.query(
      `
        UPDATE SCOUT_MESSAGES
        SET message_content = $2,
            status = $3,
            updated_at = NOW()
        WHERE scout_message_id = $1
        RETURNING
          scout_message_id::text AS id,
          created_at,
          COALESCE(created_by_employee_id, '') AS creator,
          '' AS title,
          COALESCE(message_content, '') AS body,
          COALESCE(status, 'DRAFT') AS status
      `,
      [Number(id), body, status],
    );

    return rows[0] ?? null;
  }

  async findLatestRejectCommentByScoutId(id: string): Promise<string> {
    const rows = await this.dataSource.query(
      `
        SELECT return_comment
        FROM SCOUT_MESSAGE_HISTORIES
        WHERE scout_message_id = $1
        ORDER BY returned_at DESC NULLS LAST, scout_message_history_id DESC
        LIMIT 1
      `,
      [Number(id)],
    );

    return rows[0]?.return_comment ?? '';
  }

  async saveGeneratedMessage(messageContent: string): Promise<number> {
    const rows = await this.dataSource.query(
      `
        INSERT INTO SCOUT_MESSAGES (
          message_content,
          status,
          created_at,
          updated_at
        )
        VALUES ($1, 'DRAFT', NOW(), NOW())
        RETURNING scout_message_id
      `,
      [messageContent],
    );

    return Number(rows[0].scout_message_id);
  }

  async findAllActive(
    scoutMessageId?: number,
  ): Promise<ScoutMessageWithRelationsRow[]> {
    const hasIdFilter = scoutMessageId !== undefined && scoutMessageId !== null;

    return this.dataSource.query(
      `
        SELECT
          sm.scout_message_id,
          sm.message_content,
          sm.sent_at,
          sm.job_posting_id,
          sm.job_seeker_id,
          sm.created_by_employee_id,
          sm.updated_by_employee_id,
          sm.status,
          sm.created_at,
          sm.updated_at,
          jp.company_name,
          jp.job_title,
          js.age AS job_seeker_age,
          js.gender AS job_seeker_gender,
          js.desired_position
        FROM SCOUT_MESSAGES sm
        LEFT JOIN JOB_POSTINGS jp ON jp.job_posting_id = sm.job_posting_id
        LEFT JOIN JOB_SEEKERS js ON js.job_seeker_id = sm.job_seeker_id
        WHERE sm.status IS NOT NULL
          AND ($1::boolean = false OR sm.scout_message_id = $2)
        ORDER BY sm.created_at DESC NULLS LAST, sm.scout_message_id DESC
      `,
      [hasIdFilter, scoutMessageId ?? null],
    );
  }

  async findLatest(
    limit = 20,
    order = "updated_at",
  ): Promise<ScoutMessageRow[]> {
    return this.dataSource.query(
      `
        SELECT
          scout_message_id,
          message_content,
          sent_at,
          job_posting_id,
          job_seeker_id,
          created_by_employee_id,
          updated_by_employee_id,
          status,
          created_at,
          updated_at
        FROM SCOUT_MESSAGES
        ORDER BY $2 DESC NULLS LAST, scout_message_id DESC
        LIMIT $1
      `,
      [limit, order],
    );
  }

  async create(input: CreateScoutMessageInput): Promise<ScoutMessageRow> {
    if (!input.job_posting_id || !input.job_seeker_id) {
      throw new Error("job_posting_id と job_seeker_id は必須です");
    }

    const rows = await this.dataSource.query(
      `
        INSERT INTO SCOUT_MESSAGES (
          message_content,
          job_posting_id,
          job_seeker_id,
          created_by_employee_id,
          updated_by_employee_id,
          status,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $4, $5, NOW(), NOW())
        RETURNING
          scout_message_id,
          message_content,
          sent_at,
          job_posting_id,
          job_seeker_id,
          created_by_employee_id,
          updated_by_employee_id,
          status,
          created_at,
          updated_at
      `,
      [
        input.message_content,
        input.job_posting_id,
        input.job_seeker_id,
        input.created_by_employee_id ?? null,
        input.status ?? null,
      ],
    );

    return rows[0];
  }

  async createWithRelations(
    input: CreateScoutMessageInput,
  ): Promise<ScoutMessageWithRelationsRow> {
    if (!input.job_posting_id || !input.job_seeker_id) {
      throw new Error("job_posting_id と job_seeker_id は必須です");
    }

    const rows = await this.dataSource.query(
      `
        INSERT INTO SCOUT_MESSAGES (
          message_content,
          job_posting_id,
          job_seeker_id,
          created_by_employee_id,
          updated_by_employee_id,
          status,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $4, $5, NOW(), NOW())
        RETURNING scout_message_id
      `,
      [
        input.message_content,
        input.job_posting_id,
        input.job_seeker_id,
        input.created_by_employee_id ?? null,
        input.status ?? null,
      ],
    );

    return this.findByIdWithRelations(rows[0].scout_message_id);
  }

  async findByIdWithRelations(
    scoutMessageId: number,
  ): Promise<ScoutMessageWithRelationsRow> {
    const rows = await this.dataSource.query(
      `
        SELECT
          sm.scout_message_id,
          sm.message_content,
          sm.sent_at,
          sm.job_posting_id,
          sm.job_seeker_id,
          sm.created_by_employee_id,
          sm.updated_by_employee_id,
          sm.status,
          sm.created_at,
          sm.updated_at,
          jp.company_name,
          jp.job_title,
          js.age AS job_seeker_age,
          js.gender AS job_seeker_gender,
          js.desired_position
        FROM SCOUT_MESSAGES sm
        LEFT JOIN JOB_POSTINGS jp ON jp.job_posting_id = sm.job_posting_id
        LEFT JOIN JOB_SEEKERS js ON js.job_seeker_id = sm.job_seeker_id
        WHERE sm.scout_message_id = $1
        LIMIT 1
      `,
      [scoutMessageId],
    );

    return rows[0];
  }

  async updateStatus(
    scoutMessageId: number,
    status: string,
    updatedByEmployeeId?: string | null,
  ): Promise<ScoutMessageRow | null> {
    const rows = await this.dataSource.query(
      `
        UPDATE SCOUT_MESSAGES
        SET status = $2,
            updated_by_employee_id = $3,
            updated_at = NOW()
        WHERE scout_message_id = $1
        RETURNING
          scout_message_id,
          message_content,
          sent_at,
          job_posting_id,
          job_seeker_id,
          created_by_employee_id,
          updated_by_employee_id,
          status,
          created_at,
          updated_at
      `,
      [scoutMessageId, status, updatedByEmployeeId ?? null],
    );

    if (!rows.length) {
      return null;
    }

    return rows[0];
  }

  async approve(
    scoutMessageId: number,
    updatedByEmployeeId?: string | null,
  ): Promise<ScoutMessageRow | null> {
    const rows = await this.dataSource.query(
      `
        UPDATE SCOUT_MESSAGES
        SET status = 'APPROVED',
            sent_at = COALESCE(sent_at, NOW()),
            updated_by_employee_id = $2,
            updated_at = NOW()
        WHERE scout_message_id = $1
        RETURNING
          scout_message_id,
          message_content,
          sent_at,
          job_posting_id,
          job_seeker_id,
          created_by_employee_id,
          updated_by_employee_id,
          status,
          created_at,
          updated_at
      `,
      [scoutMessageId, updatedByEmployeeId ?? null],
    );

    if (!rows.length) {
      return null;
    }

    return rows[0];
  }

  async rejectAndSaveHistory(
    input: RejectScoutMessageInput,
  ): Promise<ScoutMessageRow | null> {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      const currentRows = await runner.query(
        `
          SELECT
            scout_message_id,
            message_content,
            sent_at,
            job_posting_id,
            job_seeker_id,
            created_by_employee_id,
            updated_by_employee_id,
            status,
            created_at,
            updated_at
          FROM SCOUT_MESSAGES
          WHERE scout_message_id = $1
          LIMIT 1
        `,
        [input.scout_message_id],
      );

      if (!currentRows.length) {
        await runner.rollbackTransaction();
        return null;
      }

      const current = currentRows[0];
      const historyRows = await runner.query(
        `
          INSERT INTO SCOUT_MESSAGE_HISTORIES (
            scout_message_id,
            message_content,
            return_comment,
            returned_by_employee_id,
            returned_at,
            sent_at
          )
          VALUES ($1, $2, $3, $4, NOW(), $5)
          RETURNING scout_message_history_id
        `,
        [
          input.scout_message_id,
          current.message_content,
          input.return_comment,
          input.returned_by_employee_id ?? null,
          current.sent_at,
        ],
      );

      const historyId = historyRows[0].scout_message_history_id;
      const genreIds = input.genre_ids ?? [];

      for (const genreId of genreIds) {
        await runner.query(
          `
            INSERT INTO RETURN_COMMENT_HISTORY_GENRES (
              scout_message_history_id,
              genre_id
            )
            VALUES ($1, $2)
            ON CONFLICT (scout_message_history_id, genre_id) DO NOTHING
          `,
          [historyId, genreId],
        );
      }

      const updatedRows = await runner.query(
        `
          UPDATE SCOUT_MESSAGES
          SET message_content = COALESCE($2, message_content),
              status = COALESCE($3, 'RETURNED'),
              updated_by_employee_id = $4,
              updated_at = NOW()
          WHERE scout_message_id = $1
          RETURNING
            scout_message_id,
            message_content,
            sent_at,
            job_posting_id,
            job_seeker_id,
            created_by_employee_id,
            updated_by_employee_id,
            status,
            created_at,
            updated_at
        `,
        [
          input.scout_message_id,
          input.next_message_content ?? null,
          input.next_status ?? null,
          input.returned_by_employee_id ?? null,
        ],
      );

      await runner.commitTransaction();
      return updatedRows[0] ?? null;
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }
}

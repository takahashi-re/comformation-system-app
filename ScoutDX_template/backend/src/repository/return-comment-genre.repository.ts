import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

export interface ReturnCommentGenreRow {
  genre_id: number;
  genre_name: string;
}

export interface ReturnCommentGenrePositionRow {
  genre_id: number;
  position_id: number;
}

export interface ReturnCommentGenreWithPositionsRow extends ReturnCommentGenreRow {
  position_ids: number[];
}

@Injectable()
export class ReturnCommentGenreRepository {
  constructor(private readonly dataSource: DataSource) {}

  private async syncPrimaryKeySequence(): Promise<void> {
    await this.dataSource.query(`
      SELECT setval(
        pg_get_serial_sequence('return_comment_genres', 'genre_id'),
        COALESCE((SELECT MAX(genre_id) FROM return_comment_genres), 0) + 1,
        false
      )
    `);
  }

  async findAllGenres(): Promise<ReturnCommentGenreRow[]> {
    return this.dataSource.query(`
      SELECT genre_id, genre_name
      FROM RETURN_COMMENT_GENRES
      ORDER BY genre_id DESC
    `);
  }

  async findAllGenresWithPositions(): Promise<
    ReturnCommentGenreWithPositionsRow[]
  > {
    return this.dataSource.query(`
      SELECT
        g.genre_id,
        g.genre_name,
        COALESCE(
          ARRAY_AGG(gp.position_id ORDER BY gp.position_id)
          FILTER (WHERE gp.position_id IS NOT NULL),
          '{}'
        ) AS position_ids
      FROM RETURN_COMMENT_GENRES g
      LEFT JOIN RETURN_COMMENT_GENRE_POSITIONS gp ON gp.genre_id = g.genre_id
      GROUP BY g.genre_id, g.genre_name
      ORDER BY g.genre_id DESC
    `);
  }

  async addGenre(genreName: string): Promise<ReturnCommentGenreRow> {
    const normalized = String(genreName ?? "").trim();
    if (!normalized) {
      throw new Error("genreName is required");
    }

    // 既存レコードを大文字小文字無視で検索
    const existing = await this.dataSource.query(
      `SELECT genre_id, genre_name FROM RETURN_COMMENT_GENRES WHERE LOWER(TRIM(genre_name)) = LOWER(TRIM($1)) LIMIT 1`,
      [normalized],
    );
    if (existing && existing.length) {
      return existing[0];
    }

    // 既存レコードチェック後、挿入前にシーケンスを同期
    await this.syncPrimaryKeySequence();

    try {
      const rows = await this.dataSource.query(
        `
          INSERT INTO RETURN_COMMENT_GENRES (genre_name)
          VALUES ($1)
          RETURNING genre_id, genre_name
        `,
        [normalized],
      );
      return rows[0];
    } catch (err: any) {
      // Postgres の一意制約等で競合が起きた想定（スキーマにユニークが無くても安全対策）
      const retry = await this.dataSource.query(
        `SELECT genre_id, genre_name FROM RETURN_COMMENT_GENRES WHERE LOWER(TRIM(genre_name)) = LOWER(TRIM($1)) LIMIT 1`,
        [normalized],
      );
      if (retry && retry.length) return retry[0];
      throw err;
    }
  }

  async deleteGenre(genreId: number): Promise<boolean> {
    const rows = await this.dataSource.query(
      `
        DELETE FROM RETURN_COMMENT_GENRES
        WHERE genre_id = $1
        RETURNING genre_id
      `,
      [genreId],
    );

    return rows.length > 0;
  }

  async addGenrePositionLink(
    genreId: number,
    positionId: number,
  ): Promise<ReturnCommentGenrePositionRow> {
    const rows = await this.dataSource.query(
      `
        INSERT INTO RETURN_COMMENT_GENRE_POSITIONS (genre_id, position_id)
        VALUES ($1, $2)
        ON CONFLICT (genre_id, position_id) DO NOTHING
        RETURNING genre_id, position_id
      `,
      [genreId, positionId],
    );

    if (rows.length) {
      return rows[0];
    }

    return {
      genre_id: genreId,
      position_id: positionId,
    };
  }

  async deleteGenrePositionLink(
    genreId: number,
    positionId: number,
  ): Promise<boolean> {
    const rows = await this.dataSource.query(
      `
        DELETE FROM RETURN_COMMENT_GENRE_POSITIONS
        WHERE genre_id = $1
          AND position_id = $2
        RETURNING genre_id
      `,
      [genreId, positionId],
    );

    return rows.length > 0;
  }
}

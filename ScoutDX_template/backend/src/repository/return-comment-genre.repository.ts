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
    const rows = await this.dataSource.query(
      `
        INSERT INTO RETURN_COMMENT_GENRES (genre_name)
        VALUES ($1)
        RETURNING genre_id, genre_name
      `,
      [genreName],
    );

    return rows[0];
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

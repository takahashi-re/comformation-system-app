import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

export interface NgWordRow {
  ng_word_id: number;
  ng_word: string;
}

export interface MaxTextLengthRow {
  length_id: number;
  max_length: number;
}

@Injectable()
export class TextRuleRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findAllNgWords(): Promise<NgWordRow[]> {
    return this.dataSource.query(`
      SELECT ng_word_id, ng_word
      FROM NG_WORDS
      ORDER BY ng_word_id DESC
    `);
  }

  async addNgWord(ngWord: string): Promise<NgWordRow> {
    const rows = await this.dataSource.query(
      `
        INSERT INTO NG_WORDS (ng_word)
        VALUES ($1)
        RETURNING ng_word_id, ng_word
      `,
      [ngWord],
    );

    return rows[0];
  }

  async deleteNgWord(ngWordId: number): Promise<boolean> {
    const rows = await this.dataSource.query(
      `
        DELETE FROM NG_WORDS
        WHERE ng_word_id = $1
        RETURNING ng_word_id
      `,
      [ngWordId],
    );

    return rows.length > 0;
  }

  async updateMaxTextLength(maxLength: number): Promise<MaxTextLengthRow> {
    if (maxLength <= 0) {
      throw new Error("max_length は 1 以上で指定してください");
    }

    const updatedRows = await this.dataSource.query(
      `
        UPDATE MAX_TEXT_LENGTH
        SET max_length = $1
        WHERE length_id = (
          SELECT length_id
          FROM MAX_TEXT_LENGTH
          ORDER BY length_id DESC
          LIMIT 1
        )
        RETURNING length_id, max_length
      `,
      [maxLength],
    );

    if (updatedRows.length) {
      return updatedRows[0];
    }

    throw new Error("MAX_TEXT_LENGTH が未設定です");
  }

  async getMaxTextLength(): Promise<MaxTextLengthRow | null> {
    const rows = await this.dataSource.query(`
      SELECT length_id, max_length
      FROM MAX_TEXT_LENGTH
      ORDER BY length_id DESC
      LIMIT 1
    `);

    if (!rows.length) {
      return null;
    }

    return rows[0];
  }
}

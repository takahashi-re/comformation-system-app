import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AIConfig } from '../type/ai-config';

@Injectable()
export class AIConfigRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getConfig(): Promise<AIConfig> {
    const ngWordRows = await this.dataSource.query(`
      SELECT ng_word
      FROM NG_WORDS
      ORDER BY ng_word_id ASC
    `);

    const maxLengthRows = await this.dataSource.query(`
      SELECT max_length
      FROM MAX_TEXT_LENGTH
      ORDER BY length_id DESC
      LIMIT 1
    `);

    return {
      ngWords: ngWordRows.map((row: { ng_word: string }) => row.ng_word),
      maxLength: maxLengthRows.length ? Number(maxLengthRows[0].max_length) : 100,
    };
  }

  async saveConfig(config: AIConfig): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(`DELETE FROM NG_WORDS`);

      for (const ngWord of config.ngWords) {
        await queryRunner.query(
          `INSERT INTO NG_WORDS (ng_word) VALUES ($1)`,
          [ngWord],
        );
      }

      const maxLengthRows = await queryRunner.query(`
        SELECT length_id
        FROM MAX_TEXT_LENGTH
        ORDER BY length_id DESC
        LIMIT 1
      `);

      if (maxLengthRows.length) {
        await queryRunner.query(
          `UPDATE MAX_TEXT_LENGTH SET max_length = $1 WHERE length_id = $2`,
          [config.maxLength, maxLengthRows[0].length_id],
        );
      } else {
        await queryRunner.query(
          `INSERT INTO MAX_TEXT_LENGTH (max_length) VALUES ($1)`,
          [config.maxLength],
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

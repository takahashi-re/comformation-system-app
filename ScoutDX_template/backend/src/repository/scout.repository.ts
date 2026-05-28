import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoutEntity } from '../type/scout';

@Injectable()
export class ScoutRepository {
  constructor(
    @InjectRepository(ScoutEntity)
    private readonly repository: Repository<ScoutEntity>,
  ) {}

  async findAll(): Promise<ScoutEntity[]> {
    // 直接SQL文を発行する
    return this.repository.query(
      'SELECT * FROM scouts ORDER BY created_at DESC'
    );
  }

  async save(scout: ScoutEntity): Promise<ScoutEntity> {
    // 直接SQL文でINSERTする
    await this.repository.query(
      `INSERT INTO scouts (id, creator, title, body, status) VALUES ($1, $2, $3, $4, $5)`,
      [scout.id, scout.creator, scout.title, scout.body, scout.status]
    );
    // 直後のエンティティを返す
    const rows = await this.repository.query(
      `SELECT * FROM scouts WHERE id = $1`,
      [scout.id]
    );
    if (rows.length === 0) throw new Error('Scout not found after insert');
    return rows[0];
  }


  
  async findById(id: string) {
    const rows = await this.repository.query(
      `SELECT * FROM scouts WHERE id = $1`,
      [id]
    );
    return rows[0];
  }

  async updateScout(id: string, body: string, status: string) {
    await this.repository.query(
      `UPDATE scouts SET body = $1, status = $2 WHERE id = $3`,
      [body, status, id]
    );
    const rows = await this.repository.query(
      `SELECT * FROM scouts WHERE id = $1`,
      [id]
    );
    return rows[0];
  }

  async findLatestRejectCommentByScoutId(id: string) {
    // 差戻しコメントの取得ロジック（例: commentsテーブルから最新1件取得）
    // 必要に応じて実装
    return '';
  }
}

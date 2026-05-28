import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScoutMessageEntity } from '../type/scout-message';

@Injectable()
export class ScoutMessageRepository {
  constructor(
    @InjectRepository(ScoutMessageEntity)
    private readonly repository: Repository<ScoutMessageEntity>,
  ) {}

  async saveGeneratedMessage(messageContent: string): Promise<number> {
    const rows = await this.repository.query(
      `INSERT INTO scout_messages (message_content, status, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING scout_message_id`,
      [messageContent, 'DRAFT'],
    );

    if (!rows.length) {
      throw new Error('Scout message not found after insert');
    }

    return rows[0].scout_message_id;
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { ScoutMessageRepository } from '../repository/scout-message.repository';
import { ScoutEntity } from '../type/scout';

@Injectable()
export class ScoutService {
  constructor(private readonly scoutRepository: ScoutMessageRepository) {}

  async findAll(): Promise<ScoutEntity[]> {
    const rows = await this.scoutRepository.findAllActive();
    return rows.map((row) => ({
      id: String(row.scout_message_id),
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      creator: row.created_by_employee_id ?? '',
      title: '',
      body: row.message_content ?? '',
      status: row.status ?? '',
      company_name: row.company_name ?? '',
      job_title: row.job_title ?? '',
    })) as ScoutEntity[];
  }

  async create(input: ScoutEntity): Promise<ScoutEntity> {
    if (!input.creator?.trim() || !input.body?.trim()) {
      throw new BadRequestException('作成者・本文は必須です');
    }

    const scout = new ScoutEntity();
    scout.creator = input.creator.trim();
    scout.title = input.title?.trim() ?? '';
    scout.body = input.body.trim();
    scout.status = input.status?.trim() || 'DRAFT';

    return this.scoutRepository.save(scout);
  }

  
  async findOne(id: string) {
    // スカウト詳細と最新差戻しコメントを返す
    const scout = await this.scoutRepository.findById(id);
    const latestRejectComment = await this.scoutRepository.findLatestRejectCommentByScoutId(id);
    return { scout, latestRejectComment };
  }

  async update(id: string, dto: { body: string, status: string }) {
    return this.scoutRepository.updateScout(id, dto.body, dto.status);
  }
}

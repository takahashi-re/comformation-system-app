import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EmployeeRepository } from '../repository/employee.repository';
import { ScoutMessageRepository } from '../repository/scout-message.repository';
import { ScoutEntity } from '../type/scout';

@Injectable()
export class ScoutService {
  constructor(
    private readonly scoutRepository: ScoutMessageRepository,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  findAll(): Promise<ScoutEntity[]> {
    return this.scoutRepository.findAll();
  }

  async create(input: ScoutEntity): Promise<ScoutEntity> {
    if (!input.creator?.trim() || !input.title?.trim() || !input.body?.trim()) {
      throw new BadRequestException('作成者・タイトル・本文は必須です');
    }

    const scout = new ScoutEntity();
    scout.id = this.generateId();
    scout.creator = input.creator.trim();
    scout.title = input.title.trim();
    scout.body = input.body.trim();
    scout.status = input.status?.trim() || 'DRAFT';

    return this.scoutRepository.save(scout);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9).toUpperCase();
  }

  
  async findOne(id: string) {
    // スカウト詳細と最新差戻しコメントを返す
    const scout = await this.scoutRepository.findById(id);
    const latestRejectComment = await this.scoutRepository.findLatestRejectCommentByScoutId(id);
    return { scout, latestRejectComment };
  }

  async findApprovalDetail(id: string) {
    const detail = await this.scoutRepository.findApprovalDetailById(id);

    if (!detail) {
      throw new NotFoundException('対象のスカウト文が見つかりません');
    }

    return detail;
  }

  async update(id: string, dto: { body: string, status: string }) {
    return this.scoutRepository.updateScout(id, dto.body, dto.status);
  }

  async approve(
    id: string,
    dto: {
      approverEmployeeId: string;
      comment: string;
      reasonKeys: string[];
    },
  ) {
    const scoutMessageId = Number(id);
    if (!Number.isFinite(scoutMessageId)) {
      throw new BadRequestException('不正なスカウトIDです');
    }

    if (!dto.approverEmployeeId?.trim()) {
      throw new BadRequestException('承認者IDは必須です');
    }

    const approver = await this.employeeRepository.findByEmployeeId(
      dto.approverEmployeeId.trim(),
    );

    if (!approver) {
      throw new NotFoundException('承認者が見つかりません');
    }

    const isAdmin = approver.position_id === 3 || approver.position_name === 'Manager';
    const isApprover = approver.position_id === 2 || approver.position_name === 'Leader';

    if (!isAdmin && !isApprover) {
      throw new BadRequestException('このユーザーには承認権限がありません');
    }

    const nextStatus = isAdmin ? 'AVAILABLE' : 'PENDING_ADMIN';
    const updated = await this.scoutRepository.updateStatus(
      scoutMessageId,
      nextStatus,
      dto.approverEmployeeId.trim(),
    );

    if (!updated) {
      throw new NotFoundException('対象のスカウト文が見つかりません');
    }

    return updated;
  }

  async reject(
    id: string,
    dto: {
      returnedByEmployeeId: string;
      returnComment: string;
      reasonKeys: string[];
      reapplyTarget?: 'APPROVER' | 'ADMIN';
    },
  ) {
    const scoutMessageId = Number(id);
    if (!Number.isFinite(scoutMessageId)) {
      throw new BadRequestException('不正なスカウトIDです');
    }

    const returnComment = dto.returnComment?.trim() ?? '';
    if (!returnComment) {
      throw new BadRequestException('差戻しコメントは必須です');
    }

    if (returnComment.length > 2000) {
      throw new BadRequestException('差戻しコメントは2000文字以内で入力してください');
    }

    const returnedByEmployeeId = dto.returnedByEmployeeId?.trim();
    if (!returnedByEmployeeId) {
      throw new BadRequestException('差戻し担当者IDは必須です');
    }

    const reviewer = await this.employeeRepository.findByEmployeeId(returnedByEmployeeId);
    if (!reviewer) {
      throw new NotFoundException('差戻し担当者が見つかりません');
    }

    const isAdmin = reviewer.position_id === 3 || reviewer.position_name === 'Manager';
    const isApprover = reviewer.position_id === 2 || reviewer.position_name === 'Leader';

    if (!isAdmin && !isApprover) {
      throw new BadRequestException('このユーザーには差戻し権限がありません');
    }

    if (isAdmin && dto.reapplyTarget !== 'APPROVER' && dto.reapplyTarget !== 'ADMIN') {
      throw new BadRequestException('管理者差戻し時は再申請先の指定が必要です');
    }

    const nextStatus = !isAdmin || dto.reapplyTarget === 'APPROVER'
      ? 'REJECTED_BY_APPROVER'
      : 'REJECTED_BY_ADMIN';

    const updated = await this.scoutRepository.rejectAndSaveHistory({
      scout_message_id: scoutMessageId,
      return_comment: returnComment,
      returned_by_employee_id: returnedByEmployeeId,
      genre_ids: [],
      next_status: nextStatus,
    });

    if (!updated) {
      throw new NotFoundException('対象のスカウト文が見つかりません');
    }

    return updated;
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AIConfigRepository } from "../repository/ai-config.repository";
import { EmployeeRepository } from "../repository/employee.repository";
import { ReturnCommentGenreRepository } from "../repository/return-comment-genre.repository";
import { ScoutMessageRepository } from "../repository/scout-message.repository";
import { ScoutEntity } from "../type/scout";

@Injectable()
export class ScoutService {
  constructor(
    private readonly scoutRepository: ScoutMessageRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly aiConfigRepository: AIConfigRepository,
    private readonly returnCommentGenreRepository: ReturnCommentGenreRepository,
  ) {}

  private async resolveGenreIdsFromReasonKeys(
    reasonKeys: string[],
  ): Promise<number[]> {
    const normalizedKeys = [
      ...new Set(
        (reasonKeys ?? [])
          .map((key) => String(key ?? "").trim())
          .filter(Boolean),
      ),
    ];
    if (!normalizedKeys.length) {
      return [];
    }

    const genres = await this.returnCommentGenreRepository.findAllGenres();
    const validGenreIds = new Set<number>(
      genres.map((genre) => Number(genre.genre_id)),
    );

    const invalidKeyFormats: string[] = [];
    const genreIds = normalizedKeys
      .map((key) => {
        const prefixedIdMatch = /^genre:(\d+)$/i.exec(key);
        if (prefixedIdMatch) {
          return Number(prefixedIdMatch[1]);
        }

        if (/^\d+$/.test(key)) {
          return Number(key);
        }

        invalidKeyFormats.push(key);
        return null;
      })
      .filter(
        (genreId): genreId is number =>
          genreId !== null && Number.isFinite(genreId),
      );

    if (invalidKeyFormats.length) {
      throw new BadRequestException(
        `不正な差戻し理由キーです（genre:{id} 形式または数値IDを指定してください）: ${invalidKeyFormats.join(", ")}`,
      );
    }

    const invalidGenreIds = [...new Set(genreIds)].filter(
      (genreId) => !validGenreIds.has(genreId),
    );
    if (invalidGenreIds.length) {
      throw new BadRequestException(
        `差戻し理由マスタに存在しないジャンルIDです: ${invalidGenreIds.join(", ")}`,
      );
    }

    return [...new Set(genreIds)];
  }

  async getGenresForPosition(positionId: number) {
    if (!Number.isFinite(positionId) || positionId <= 0) {
      throw new BadRequestException("不正なロール情報です");
    }

    const genres =
      await this.returnCommentGenreRepository.findAllGenresWithPositions();
    return genres
      .filter((genre) =>
        (genre.position_ids ?? []).map(Number).includes(positionId),
      )
      .map((genre) => ({
        genre_id: Number(genre.genre_id),
        genre_name: genre.genre_name,
      }));
  }

  async addGenreForPosition(positionId: number, genreName: string) {
    if (!Number.isFinite(positionId) || positionId <= 0) {
      throw new BadRequestException("不正なロール情報です");
    }

    const normalizedName = String(genreName ?? "").trim();
    if (!normalizedName) {
      throw new BadRequestException("ジャンル名は必須です");
    }

    const genres =
      await this.returnCommentGenreRepository.findAllGenresWithPositions();
    const existing = genres.find(
      (genre) => genre.genre_name === normalizedName,
    );
    const genreId = existing
      ? Number(existing.genre_id)
      : Number(
          (await this.returnCommentGenreRepository.addGenre(normalizedName))
            .genre_id,
        );

    await this.returnCommentGenreRepository.addGenrePositionLink(
      genreId,
      positionId,
    );
    return this.getGenresForPosition(positionId);
  }

  async deleteGenreForPosition(positionId: number, genreId: number) {
    if (!Number.isFinite(positionId) || positionId <= 0) {
      throw new BadRequestException("不正なロール情報です");
    }

    if (!Number.isFinite(genreId) || genreId <= 0) {
      throw new BadRequestException("不正なジャンルIDです");
    }

    const deleted =
      await this.returnCommentGenreRepository.deleteGenrePositionLink(
        genreId,
        positionId,
      );
    if (!deleted) {
      throw new NotFoundException("対象のジャンル紐付けが見つかりません");
    }

    const genresAfterDelete =
      await this.returnCommentGenreRepository.findAllGenresWithPositions();
    const target = genresAfterDelete.find(
      (genre) => Number(genre.genre_id) === genreId,
    );
    if (target && (!target.position_ids || target.position_ids.length === 0)) {
      await this.returnCommentGenreRepository.deleteGenre(genreId);
    }

    return this.getGenresForPosition(positionId);
  }

  private normalizeText(value: string): string {
    return value.toLowerCase();
  }

  private findIncludedNgWords(text: string, ngWords: string[]): string[] {
    const normalizedText = this.normalizeText(text);
    const hits: string[] = [];
    const seen = new Set<string>();

    for (const rawWord of ngWords) {
      const word = String(rawWord ?? "").trim();
      const normalizedWord = this.normalizeText(word);

      if (!normalizedWord) {
        continue;
      }

      if (
        normalizedText.includes(normalizedWord) &&
        !seen.has(normalizedWord)
      ) {
        seen.add(normalizedWord);
        hits.push(word);
      }
    }

    return hits;
  }

  async findAll(): Promise<ScoutEntity[]> {
    const rows = await this.scoutRepository.findAllActive();
    return rows.map((row) => ({
      id: String(row.scout_message_id),
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
      creator: row.created_by_employee_id ?? "",
      title: "",
      body: row.message_content ?? "",
      status: row.status ?? "",
      company_name: row.company_name ?? "",
      job_title: row.job_title ?? "",
      job_seeker_age: row.job_seeker_age ?? undefined,
      job_seeker_gender: row.job_seeker_gender ?? undefined,
      updated_by_name: row.updated_by_name ?? "",
      returned_by_name: row.returned_by_name ?? "",
      reviewer_name: row.reviewer_name ?? "",
    })) as ScoutEntity[];
  }

  async create(input: ScoutEntity): Promise<ScoutEntity> {
    if (!input.creator?.trim() || !input.title?.trim() || !input.body?.trim()) {
      throw new BadRequestException("作成者・タイトル・本文は必須です");
    }

    const scout = new ScoutEntity();
    scout.id = this.generateId();
    scout.creator = input.creator.trim();
    scout.title = input.title.trim();
    scout.body = input.body.trim();
    scout.status = input.status?.trim() || "DRAFT";

    return this.scoutRepository.save(scout);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9).toUpperCase();
  }

  async findOne(id: string) {
    // スカウト詳細と最新差戻しコメントを返す
    const scout = await this.scoutRepository.findById(id);
    const latestRejectComment =
      await this.scoutRepository.findLatestRejectCommentByScoutId(id);
    return { scout, latestRejectComment };
  }

  async findApprovalDetail(id: string) {
    const detail = await this.scoutRepository.findApprovalDetailById(id);

    if (!detail) {
      throw new NotFoundException("対象のスカウト文が見つかりません");
    }

    return detail;
  }

  async update(id: string, dto: { body: string; status: string }) {
    const body = String(dto.body ?? "");
    const status = String(dto.status ?? "").trim();

    if (!body.trim()) {
      throw new BadRequestException("スカウト文を入力してください");
    }

    if (status === "PENDING_APPROVER" || status === "PENDING_ADMIN") {
      const config = await this.aiConfigRepository.getConfig();
      const ngWords = Array.isArray(config?.ngWords) ? config.ngWords : [];
      const maxLength =
        Number(config?.maxLength) > 0 ? Number(config.maxLength) : 100;

      const hitWords = this.findIncludedNgWords(body, ngWords);
      if (hitWords.length > 0) {
        throw new BadRequestException(
          `NGワードが含まれています: ${hitWords.join(", ")}`,
        );
      }

      if (body.length > maxLength) {
        throw new BadRequestException(
          `文字数が上限を超えています（${body.length}/${maxLength}文字）`,
        );
      }
    }

    const updated = await this.scoutRepository.updateScout(id, body, status);
    if (!updated) {
      throw new NotFoundException("対象のスカウト文が見つかりません");
    }

    return updated;
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
      throw new BadRequestException("不正なスカウトIDです");
    }

    if (!dto.approverEmployeeId?.trim()) {
      throw new BadRequestException("承認者IDは必須です");
    }

    const approver = await this.employeeRepository.findByEmployeeId(
      dto.approverEmployeeId.trim(),
    );

    if (!approver) {
      throw new NotFoundException("承認者が見つかりません");
    }

    const isAdmin =
      approver.position_id === 3 || approver.position_name === "Manager"; //管理者
    const isApprover =
      approver.position_id === 2 || approver.position_name === "Leader"; //承認者

    if (!isAdmin && !isApprover) {
      throw new BadRequestException("このユーザーには承認権限がありません");
    }

    const nextStatus = isAdmin ? "AVAILABLE" : "PENDING_ADMIN";
    const updated = await this.scoutRepository.approveAndSaveHistory({
      scout_message_id: scoutMessageId,
      approved_by_employee_id: dto.approverEmployeeId.trim(),
      comment: dto.comment?.trim() ?? "",
      next_status: nextStatus,
    });

    if (!updated) {
      throw new NotFoundException("対象のスカウト文が見つかりません");
    }

    return updated;
  }

  async reject(
    id: string,
    dto: {
      returnedByEmployeeId: string;
      returnComment: string;
      reasonKeys: string[];
      reapplyTarget?: "APPROVER" | "ADMIN";
    },
  ) {
    const scoutMessageId = Number(id);
    if (!Number.isFinite(scoutMessageId)) {
      throw new BadRequestException("不正なスカウトIDです");
    }

    const returnComment = dto.returnComment?.trim() ?? "";
    if (!returnComment) {
      throw new BadRequestException("差戻しコメントは必須です");
    }

    if (returnComment.length > 2000) {
      throw new BadRequestException(
        "差戻しコメントは2000文字以内で入力してください",
      );
    }

    const returnedByEmployeeId = dto.returnedByEmployeeId?.trim();
    if (!returnedByEmployeeId) {
      throw new BadRequestException("差戻し担当者IDは必須です");
    }

    const reviewer =
      await this.employeeRepository.findByEmployeeId(returnedByEmployeeId);
    if (!reviewer) {
      throw new NotFoundException("差戻し担当者が見つかりません");
    }

    const isAdmin =
      reviewer.position_id === 3 || reviewer.position_name === "Manager";
    const isApprover =
      reviewer.position_id === 2 || reviewer.position_name === "Leader";

    if (!isAdmin && !isApprover) {
      throw new BadRequestException("このユーザーには差戻し権限がありません");
    }

    if (
      isAdmin &&
      dto.reapplyTarget !== "APPROVER" &&
      dto.reapplyTarget !== "ADMIN"
    ) {
      throw new BadRequestException("管理者差戻し時は再申請先の指定が必要です");
    }

    const nextStatus =
      !isAdmin || dto.reapplyTarget === "APPROVER"
        ? "REJECTED_BY_APPROVER"
        : "REJECTED_BY_ADMIN";

    const genreIds = await this.resolveGenreIdsFromReasonKeys(dto.reasonKeys);

    const updated = await this.scoutRepository.rejectAndSaveHistory({
      scout_message_id: scoutMessageId,
      return_comment: returnComment,
      returned_by_employee_id: returnedByEmployeeId,
      genre_ids: genreIds,
      next_status: nextStatus,
    });

    if (!updated) {
      throw new NotFoundException("対象のスカウト文が見つかりません");
    }

    return updated;
  }
}

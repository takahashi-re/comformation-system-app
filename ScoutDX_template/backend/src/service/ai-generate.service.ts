import { Injectable } from '@nestjs/common';
import { ScoutMessageRepository } from '../repository/scout-message.repository';

interface JobInfo {
  companyName: string;
  jobTitle: string;
  businessContent: string;
  requiredSkills: string;
  location: string;
  salary: number;
  appealPoints: string;
}

interface ApplicantInfo {
  gender: string;
  age: number | null;
  desiredJobTitle: string;
  aiInstructions: string;
}

interface GenerateRequest {
  jobInfo: JobInfo;
  applicantInfo: ApplicantInfo;
  textStyle?: string;
}

@Injectable()
export class AiGenerateService {
  private readonly samples = [
    `はじめまして。弊社の採用担当です。

プロフィールを拝見し、これまでのご経験に大変興味を持ちました。特にチームでの開発推進や品質改善への取り組みが、当社のカルチャーと合致していると感じています。

もしご興味がおありでしたら、まずはカジュアルにお話しできれば幸いです。ご多忙のところ恐れ入りますが、ご検討いただけますと嬉しいです。`,
    `突然のご連絡失礼いたします。〇〇株式会社でエンジニア採用を担当しております。

ご実績を拝見し、ぜひ当社のプロダクト開発チームでお力をお借りしたいと考え、ご連絡いたしました。リモートワークも可能で、技術選定への関与度も高い環境です。

ご不明点があればお気軽にお問い合わせください。面談のご都合がよろしければ、ご返信いただけますと幸いです。`,
    `プロフィールを拝見し、ご連絡させていただきました。

当社では〇〇領域のサービスを展開しており、バックエンドからフロントエンドまで幅広く携わっていただける方を探しております。ご経験の技術スタックは、現在の開発体制とも好相性です。

まずは30分ほどオンラインでご説明させていただければと思います。ご興味をお持ちいただけましたら、お気軽にご返信ください。`,
  ];

  constructor(private readonly scoutMessageRepository: ScoutMessageRepository) {}

  getSample(): { body: string } {
    const index = Math.floor(Math.random() * this.samples.length);
    return { body: this.samples[index] };
  }

  async generateFromForm(input: GenerateRequest): Promise<{ body: string; scoutId: string }> {
    const genderLabel =
      input.applicantInfo.gender === 'male'
        ? '男性'
        : input.applicantInfo.gender === 'female'
          ? '女性'
          : '不問';

    const ageLabel =
      input.applicantInfo.age === null
        ? '年齢不問'
        : `${input.applicantInfo.age}歳`;

    const desiredJob =
      input.applicantInfo.desiredJobTitle || 'ご経験に合うポジション';

    const style = input.textStyle?.trim() || '指定なし';

    const instruction = input.applicantInfo.aiInstructions?.trim()
      ? `\n\n補足（人物像）: ${input.applicantInfo.aiInstructions.trim()}`
      : '';

    const body =
      `はじめまして。${input.jobInfo.companyName}の採用担当です。\n\n` +
      `${desiredJob}にご関心をお持ちの方へ、当社の「${input.jobInfo.jobTitle}」ポジションをご紹介します。\n` +
      `勤務地は${input.jobInfo.location}、想定給与は${input.jobInfo.salary}です。\n\n` +
      `【業務内容】\n${input.jobInfo.businessContent}\n\n` +
      `【必須スキル】\n${input.jobInfo.requiredSkills}\n\n` +
      `【この求人の魅力】\n${input.jobInfo.appealPoints}\n\n` +
      `対象イメージ: ${genderLabel} / ${ageLabel}\n` +
      `文体指定: ${style}\n\n` +
      '少しでもご興味をお持ちいただけましたら、ぜひ一度カジュアルにお話しできれば幸いです。' +
      instruction;

    const savedScoutId = await this.scoutMessageRepository.saveGeneratedMessage(body);

    return { body, scoutId: String(savedScoutId) };
  }
}

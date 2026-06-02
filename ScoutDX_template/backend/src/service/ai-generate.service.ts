import { Injectable } from "@nestjs/common";
import { ScoutMessageRepository } from "../repository/scout-message.repository";
import { JobPostingRepository } from "../repository/job-posting.repository";
import { JobSeekerRepository } from "../repository/job-seeker.repository";

interface JobInfo {
  companyName: string;
  jobTitle: string;
  businessContent: string;
  requiredSkills: string;
  location: string;
  minSalary: number;
  maxSalary: number;
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
  textStyle?: "casual" | "formal";
  createdByEmployeeId?: string;
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

  constructor(
    private readonly scoutMessageRepository: ScoutMessageRepository,
    private readonly jobPostingRepository: JobPostingRepository,
    private readonly jobSeekerRepository: JobSeekerRepository,
  ) {}

  getSample(): { body: string } {
    const index = Math.floor(Math.random() * this.samples.length);
    return { body: this.samples[index] };
  }

  async generateFromForm(
    input: GenerateRequest,
  ): Promise<{ body: string; scoutId: string }> {
    if (!input.jobInfo.companyName?.trim() || !input.jobInfo.jobTitle?.trim()) {
      throw new Error("求人情報の必須項目が不足しています");
    }

    if (
      Number.isNaN(input.jobInfo.minSalary) ||
      Number.isNaN(input.jobInfo.maxSalary) ||
      input.jobInfo.minSalary < 0 ||
      input.jobInfo.maxSalary < 0 ||
      input.jobInfo.minSalary > input.jobInfo.maxSalary
    ) {
      throw new Error("給与レンジの入力値が不正です");
    }

    if (
      !input.applicantInfo.gender?.trim() ||
      input.applicantInfo.age === null
    ) {
      throw new Error("求職者情報の必須項目が不足しています");
    }

    const style = input.textStyle ?? "formal";

    const body =
      style === "casual"
        ? [
            "はじめまして！",
            "株式会社ヒューマンリンク・パートナーズの〇〇です。",
            "",
            `○○様のご経歴を拝見し、${input.jobInfo.requiredSkills}のご経験が活かせる求人をご紹介したくご連絡いたしました`,
            "",
            `今回ご紹介したいのは「${input.jobInfo.companyName}」の${input.jobInfo.jobTitle}のポジションです。`,
            "",
            `${input.jobInfo.businessContent}に携わっていただくポジションで、${input.jobInfo.appealPoints}が特徴です。`,
            "",
            `また、勤務地は${input.jobInfo.location}で、給与は${input.jobInfo.minSalary}～${input.jobInfo.maxSalary}円を想定しております。`,
            "",
            "もし少しでも興味をお持ちいただけたら、まずは気軽に情報交換できれば嬉しいです。",
            "",
            "ご返信お待ちしています！",
          ].join("\n")
        : [
            "はじめまして。",
            "株式会社ヒューマンリンク・パートナーズの○○と申します。",
            "",
            `○○様のご経歴を拝見し、${input.jobInfo.requiredSkills}のご経験を活かしていただける求人があると考え、ぜひ一度ご紹介申し上げたく、ご連絡いたしました。`,
            "",
            `このたびご紹介申し上げますのは、「${input.jobInfo.companyName}」における${input.jobInfo.jobTitle}のポジションでございます。`,
            "",
            `${input.jobInfo.businessContent}に携わることができ、${input.jobInfo.appealPoints}が特徴でございます。`,
            "",
            `さらに、勤務地は${input.jobInfo.location}で、想定給与は${input.jobInfo.minSalary}～${input.jobInfo.maxSalary}円となっております。`,
            "",
            "もしご興味をお持ちいただけましたら、まずは情報交換の機会を頂戴できましたら幸いに存じます。",
            "",
            "何卒ご検討のほどよろしくお願い申し上げます。",
          ].join("\n");

    const jobPosting = await this.jobPostingRepository.create({
      company_name: input.jobInfo.companyName.trim(),
      job_title: input.jobInfo.jobTitle.trim(),
      job_description: input.jobInfo.businessContent.trim(),
      min_salary: input.jobInfo.minSalary,
      max_salary: input.jobInfo.maxSalary,
      required_skills: input.jobInfo.requiredSkills.trim(),
      job_appeal: input.jobInfo.appealPoints.trim(),
      work_location: input.jobInfo.location.trim(),
    });

    const jobSeeker = await this.jobSeekerRepository.create({
      gender: input.applicantInfo.gender.trim(),
      age: input.applicantInfo.age,
      desired_position: input.applicantInfo.desiredJobTitle?.trim() || null,
    });

    const scoutMessage = await this.scoutMessageRepository.create({
      message_content: body,
      job_posting_id: Number(jobPosting.job_posting_id),
      job_seeker_id: Number(jobSeeker.job_seeker_id),
      created_by_employee_id: input.createdByEmployeeId?.trim() || null,
      status: "DRAFT",
    });

    return { body, scoutId: String(scoutMessage.scout_message_id) };
  }
}

import { Injectable } from '@nestjs/common';
import { AIConfig } from '../type/ai-config';
import { AIConfigRepository } from '../repository/ai-config.repository';

@Injectable()
export class AIConfigService {
  constructor(private readonly repo: AIConfigRepository) {}

  private normalizeWord(word: string): string {
    return word.trim();
  }

  async getConfig(): Promise<AIConfig> {
    return this.repo.getConfig();
  }

  async saveConfig(config: AIConfig): Promise<void> {
    const normalizedNgWords: string[] = [];
    const seen = new Set<string>();

    for (const rawWord of config.ngWords) {
      const word = this.normalizeWord(rawWord);
      if (!word) continue;

      const key = word.toLowerCase();
      if (seen.has(key)) continue;

      seen.add(key);
      normalizedNgWords.push(word);
    }

    const maxLength = Number(config.maxLength);
    if (!Number.isFinite(maxLength) || maxLength <= 0) {
      throw new Error('maxLength は 1 以上で指定してください');
    }

    await this.repo.saveConfig({
      ngWords: normalizedNgWords,
      maxLength,
    });
  }
}

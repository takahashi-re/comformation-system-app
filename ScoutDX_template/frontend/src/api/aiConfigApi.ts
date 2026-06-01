import type { AIConfig } from '../type/aiConfig';
import { apiClient } from './client';

// AI設定の取得
export async function fetchAIConfig(): Promise<AIConfig> {
  const { data } = await apiClient.get<AIConfig>('/api/ai-config');
  return data;
}

// AI設定の保存
export async function saveAIConfig(config: AIConfig): Promise<void> {
  await apiClient.post('/api/ai-config', config);
}

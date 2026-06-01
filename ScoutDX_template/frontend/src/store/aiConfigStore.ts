import { ref } from 'vue';
import type { AIConfig } from '../type/aiConfig';
import { fetchAIConfig, saveAIConfig } from '../api/aiConfigApi';

export function useAIConfigStore() {
  const aiConfig = ref<AIConfig>({ ngWords: [], maxLength: 100 });
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      aiConfig.value = await fetchAIConfig();
    } catch (e: any) {
      error.value = e.message || '取得に失敗しました';
    } finally {
      loading.value = false;
    }
  }

  async function save() {
    loading.value = true;
    error.value = null;
    try {
      await saveAIConfig(aiConfig.value);
    } catch (e: any) {
      error.value = e.message || '保存に失敗しました';
    } finally {
      loading.value = false;
    }
  }

  return { aiConfig, loading, error, load, save };
}

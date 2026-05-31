import type { ScoutEntity } from '../type/scout'
import { apiClient } from './client'

export async function fetchScouts(): Promise<ScoutEntity[]> {
  const { data } = await apiClient.get<ScoutEntity[]>('/api/scouts')
  return data
}

export async function createScout(payload: ScoutEntity): Promise<ScoutEntity> {
  const { data } = await apiClient.post<ScoutEntity>('/api/scouts', payload)
  return data
}


//IDを渡して、スカウト文と最新の差戻しコメントを取得するAPI
export async function fetchScoutDetail(id: string): Promise<{ scout: ScoutEntity, latestRejectComment: string }> {
  const { data } = await apiClient.get(`/api/scouts/${id}`)
  return data
}

//スカウト文を保存するAPI
export async function updateScout(payload: { id: string, body: string, status: string }): Promise<void> {
  await apiClient.put(`/api/scouts/${payload.id}`, payload)
}
import type { CreateScoutDocumentPayload, DecideScoutDocumentPayload, ScoutDocument } from './types'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({ message: 'リクエストに失敗しました。' }))) as {
      message?: string
    }
    throw new Error(errorBody.message || 'リクエストに失敗しました。')
  }

  return (await response.json()) as T
}

export const fetchScoutDocuments = () => request<ScoutDocument[]>('/scout-documents')

export const createScoutDocument = (payload: CreateScoutDocumentPayload) =>
  request<ScoutDocument>('/scout-documents', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const decideScoutDocument = (id: number, payload: DecideScoutDocumentPayload) =>
  request<ScoutDocument>(`/scout-documents/${id}/decision`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

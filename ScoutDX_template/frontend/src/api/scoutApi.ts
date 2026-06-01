import type { ScoutEntity } from '../type/scout'
import { apiClient } from './client'

export interface ApprovalCommentHistory {
  historyId: number
  returnComment: string
  returnedAt: string | null
  returnedByEmployeeId: string | null
  returnedByEmployeeName: string
}

export interface ApprovalJobInfo {
  jobPostingId: number | null
  companyName: string
  jobTitle: string
  jobDescription: string
  minSalary: number | null
  maxSalary: number | null
  requiredSkills: string
  jobAppeal: string
  workLocation: string
}

export interface ApprovalDetailResponse {
  scoutBody: string
  jobInfo: ApprovalJobInfo
  commentHistories: ApprovalCommentHistory[]
}

export async function fetchScouts(): Promise<ScoutEntity[]> {
  const { data } = await apiClient.get<ScoutEntity[]>('/api/scouts')
  return data
}

export async function createScout(payload: ScoutEntity): Promise<ScoutEntity> {
  const { data } = await apiClient.post<ScoutEntity>('/api/scouts', payload)
  return data
}

// IDを渡して、スカウト文と最新の差戻しコメントを取得するAPI
export async function fetchScoutDetail(id: number): Promise<{ scout: ScoutEntity, latestRejectComment: string }> {
  const { data } = await apiClient.get(`/api/scouts/${id}`)
  return data
}

export async function fetchApprovalDetail(id: number | string): Promise<ApprovalDetailResponse> {
  const { data } = await apiClient.get<ApprovalDetailResponse>(`/api/scouts/${id}/approval-detail`)
  return data
}

// スカウト文を保存するAPI
export async function updateScout(payload: { id: number, body: string, status: string }): Promise<void> {
  await apiClient.put(`/api/scouts/${payload.id}`, payload)
}

// スカウト文を承認するAPI
export async function approveScout(payload: {
  id: number | string
  approverEmployeeId: string
  comment: string
  reasonKeys: string[]
}): Promise<void> {
  await apiClient.post(`/api/scouts/${payload.id}/approve`, payload)
}

// スカウト文を差戻しするAPI
export async function rejectScout(payload: {
  id: number | string
  returnedByEmployeeId: string
  returnComment: string
  reasonKeys: string[]
  reapplyTarget?: 'APPROVER' | 'ADMIN'
}): Promise<void> {
  await apiClient.post(`/api/scouts/${payload.id}/reject`, payload)
}
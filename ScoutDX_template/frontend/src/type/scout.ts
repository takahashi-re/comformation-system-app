/** スカウト文（API の JSON と同じ形。新規作成時は id / createdAt は未送信） */
export interface ScoutEntity {
  id?: string
  createdAt?: string
  updatedAt?: string
  creator: string
  title: string
  body: string
  status?: string
  company_name?: string
  job_types?: string
  job_seeker_age?: number | null
  job_seeker_gender?: string | null
  updated_by_name?: string
  returned_by_name?: string
  reviewer_name?: string
}

export interface GeneratedScoutSample {
  body: string
}

import axios from 'axios'
import { apiClient } from './client'
import type { User, UserFilterParams, UserListResponse, UserRole } from '../type/user'

type RawUser = Record<string, unknown>

const roleFallback: UserRole = 'sales'

function toRole(value: unknown): UserRole {
  if (value === 'admin' || value === 'approver' || value === 'sales') {
    return value
  }
  return roleFallback
}

function toUser(raw: RawUser): User {
  const id = String(raw.userId ?? raw.id ?? raw.employee_id ?? raw.employeeId ?? '')
  const employeeId = String(raw.employeeId ?? raw.employee_id ?? id)
  const username = String(raw.username ?? raw.name ?? employeeId)
  const fullNameSource = raw.fullName ?? raw.name ?? raw.username
  const fullName = typeof fullNameSource === 'string' ? fullNameSource : undefined

  return {
    userId: id || employeeId,
    employeeId,
    username,
    fullName,
    role: toRole(raw.role),
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : undefined,
  }
}

function sortUsers(users: User[], sort?: UserFilterParams['sort']): User[] {
  const list = [...users]
  if (!sort) {
    return list
  }

  if (sort === 'username_asc') {
    return list.sort((a, b) => a.username.localeCompare(b.username, 'ja'))
  }

  if (sort === 'username_desc') {
    return list.sort((a, b) => b.username.localeCompare(a.username, 'ja'))
  }

  if (sort === 'created_asc') {
    return list.sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))
  }

  return list.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
}

function normalizeResponse(raw: unknown, params?: UserFilterParams): UserListResponse {
  const list = Array.isArray(raw)
    ? raw.map((item) => toUser(item as RawUser))
    : Array.isArray((raw as { users?: unknown[] })?.users)
      ? ((raw as { users: unknown[] }).users.map((item) => toUser(item as RawUser)))
      : []

  const filtered = params?.role ? list.filter((item) => item.role === params.role) : list
  const sorted = sortUsers(filtered, params?.sort)
  const totalCount = list.length

  return {
    users: sorted,
    totalCount,
    displayCount: sorted.length,
  }
}

async function fallbackCurrentUser(params?: UserFilterParams): Promise<UserListResponse> {
  const { data } = await apiClient.get('/api/login/me')
  return normalizeResponse([toUser(data as RawUser)], params)
}

export async function fetchUsers(params?: UserFilterParams): Promise<UserListResponse> {
  try {
    const { data } = await apiClient.get('/api/users', { params })
    return normalizeResponse(data, params)
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return fallbackCurrentUser(params)
    }
    throw error
  }
}

export async function fetchUserById(userId: string): Promise<User> {
  try {
    const { data } = await apiClient.get(`/api/users/${userId}`)
    return toUser(data as RawUser)
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      const { data } = await apiClient.get('/api/login/me')
      return toUser(data as RawUser)
    }
    throw error
  }
}

export async function deleteUserById(userId: string): Promise<void> {
  await apiClient.delete(`/api/users/${userId}`)
}

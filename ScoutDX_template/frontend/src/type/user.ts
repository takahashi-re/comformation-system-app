export type UserRole = 'admin' | 'approver' | 'sales'

export interface User {
  userId: string
  employeeId: string
  username: string
  fullName?: string
  role: UserRole
  createdAt?: string
}

export interface UserFilterParams {
  role?: UserRole
  sort?: 'username_asc' | 'username_desc' | 'created_asc' | 'created_desc'
}

export interface UserListResponse {
  users: User[]
  totalCount: number
  displayCount: number
}

export interface UpdateUserRequest {
  userId: string
  fullName: string
  role: UserRole
}

export interface CreateUserRequest {
  userId: string
  fullName: string
  role: UserRole
}

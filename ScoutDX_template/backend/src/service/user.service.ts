import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { EmployeeRepository, EmployeeRow } from "../repository/employee.repository";

type UserRole = "admin" | "approver" | "sales";
type UserSort =
  | "username_asc"
  | "username_desc"
  | "created_asc"
  | "created_desc";

export interface UserListQuery {
  role?: string;
  sort?: string;
}

export interface UserResponse {
  userId: string;
  employeeId: string;
  username: string;
  fullName: string;
  role: UserRole;
  createdAt?: string;
}

export interface UserListResponse {
  users: UserResponse[];
  totalCount: number;
  displayCount: number;
}

export interface UpdateUserRequest {
  userId?: string;
  fullName?: string;
  role?: string;
}

export interface CreateUserRequest {
  userId?: string;
  fullName?: string;
  role?: string;
}

@Injectable()
export class UserService {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

  async createUser(body: CreateUserRequest): Promise<UserResponse> {
    const employeeId = body.userId?.trim() ?? "";
    const fullName = body.fullName?.trim() ?? "";
    const role = this.toRoleFilter(body.role);

    if (!employeeId) {
      throw new BadRequestException("ユーザーIDは必須です");
    }

    if (!fullName) {
      throw new BadRequestException("氏名は必須です");
    }

    if (!role) {
      throw new BadRequestException("役職の値が不正です");
    }

    const exists = await this.employeeRepository.existsByEmployeeId(employeeId);
    if (exists) {
      throw new ConflictException("指定したユーザーIDは既に存在します");
    }

    const created = await this.employeeRepository.createEmployee(
      employeeId,
      fullName,
      employeeId,
      this.toPositionId(role),
    );

    return this.toUserResponse(created);
  }

  async getUsers(query: UserListQuery): Promise<UserListResponse> {
    const rows = await this.employeeRepository.findAll();
    const allUsers = rows.map((row) => this.toUserResponse(row));
    const normalizedRole = this.toRoleFilter(query.role);
    const normalizedSort = this.toSort(query.sort);

    const filteredUsers = normalizedRole
      ? allUsers.filter((user) => user.role === normalizedRole)
      : allUsers;
    const sortedUsers = this.sortUsers(filteredUsers, normalizedSort);

    return {
      users: sortedUsers,
      totalCount: allUsers.length,
      displayCount: sortedUsers.length,
    };
  }

  async getUserById(employeeId: string): Promise<UserResponse> {
    const row = await this.employeeRepository.findByEmployeeId(employeeId);
    if (!row) {
      throw new NotFoundException("対象のユーザーが存在しません");
    }

    return this.toUserResponse(row);
  }

  async updateUser(employeeId: string, body: UpdateUserRequest): Promise<UserResponse> {
    const current = await this.employeeRepository.findByEmployeeId(employeeId);
    if (!current) {
      throw new NotFoundException("対象のユーザーが存在しません");
    }

    const nextEmployeeId = body.userId?.trim() ?? current.employee_id;
    const nextFullName = body.fullName?.trim() ?? current.name;
    const nextRole = this.toRoleFilter(body.role) ?? this.toRole(current.position_id);

    if (!nextEmployeeId) {
      throw new BadRequestException("ユーザーIDは必須です");
    }

    if (!nextFullName) {
      throw new BadRequestException("氏名は必須です");
    }

    if (body.role && !this.toRoleFilter(body.role)) {
      throw new BadRequestException("役職の値が不正です");
    }

    if (nextEmployeeId !== employeeId) {
      const exists = await this.employeeRepository.existsByEmployeeId(nextEmployeeId);
      if (exists) {
        throw new ConflictException("指定したユーザーIDは既に存在します");
      }
    }

    let updated: EmployeeRow | null;
    try {
      updated = await this.employeeRepository.updateEmployeeProfile(
        employeeId,
        nextEmployeeId,
        nextFullName,
        this.toPositionId(nextRole),
      );
    } catch (error) {
      if (error instanceof Error && error.message === "EMPLOYEE_ID_ALREADY_EXISTS") {
        throw new ConflictException("指定したユーザーIDは既に存在します");
      }
      throw error;
    }

    if (!updated) {
      throw new NotFoundException("対象のユーザーが存在しません");
    }

    return this.toUserResponse(updated);
  }

  private toUserResponse(row: EmployeeRow): UserResponse {
    return {
      userId: row.employee_id,
      employeeId: row.employee_id,
      username: row.name,
      fullName: row.name,
      role: this.toRole(row.position_id),
      createdAt: this.toIsoDateString(row.created_at),
    };
  }

  private toIsoDateString(value: unknown): string | undefined {
    if (typeof value === "string") {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return undefined;
  }

  private toTimestamp(value?: string): number {
    if (!value) {
      return Number.MAX_SAFE_INTEGER;
    }

    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
  }

  private toRole(positionId: number | null): UserRole {
    if (positionId === 3) {
      return "admin";
    }
    if (positionId === 2) {
      return "approver";
    }
    return "sales";
  }

  private toPositionId(role: UserRole): number {
    if (role === "admin") {
      return 3;
    }

    if (role === "approver") {
      return 2;
    }

    return 1;
  }

  private toRoleFilter(role?: string): UserRole | undefined {
    if (role === "admin" || role === "approver" || role === "sales") {
      return role;
    }
    return undefined;
  }

  private toSort(sort?: string): UserSort | undefined {
    if (
      sort === "username_asc" ||
      sort === "username_desc" ||
      sort === "created_asc" ||
      sort === "created_desc"
    ) {
      return sort;
    }
    return undefined;
  }

  private sortUsers(users: UserResponse[], sort?: UserSort): UserResponse[] {
    const list = [...users];

    if (!sort) {
      return list;
    }

    if (sort === "username_asc") {
      return list.sort((a, b) => a.username.localeCompare(b.username, "ja"));
    }

    if (sort === "username_desc") {
      return list.sort((a, b) => b.username.localeCompare(a.username, "ja"));
    }

    if (sort === "created_asc") {
      return list.sort((a, b) => this.toTimestamp(a.createdAt) - this.toTimestamp(b.createdAt));
    }

    return list.sort((a, b) => this.toTimestamp(b.createdAt) - this.toTimestamp(a.createdAt));
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
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

@Injectable()
export class UserService {
  constructor(private readonly employeeRepository: EmployeeRepository) {}

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

  private toUserResponse(row: EmployeeRow): UserResponse {
    return {
      userId: row.employee_id,
      employeeId: row.employee_id,
      username: row.name,
      fullName: row.name,
      role: this.toRole(row.position_id),
      createdAt: row.created_at ?? undefined,
    };
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
      return list.sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""));
    }

    return list.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }
}

import { Controller, Get, Param, Query } from "@nestjs/common";
import { UserService } from "../service/user.service";
import type { UserListResponse, UserResponse } from "../service/user.service";

@Controller("api/users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers(
    @Query("role") role?: string,
    @Query("sort") sort?: string,
  ): Promise<UserListResponse> {
    return this.userService.getUsers({ role, sort });
  }

  @Get(":id")
  getUserById(@Param("id") id: string): Promise<UserResponse> {
    return this.userService.getUserById(id);
  }
}

import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { UserService } from "../service/user.service";
import type { UserListResponse, UserResponse } from "../service/user.service";

@Controller("api/users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(
    @Body() body: { userId?: string; fullName?: string; role?: string },
  ): Promise<UserResponse> {
    return this.userService.createUser(body);
  }

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

  @Put(":id")
  updateUser(
    @Param("id") id: string,
    @Body() body: { userId?: string; fullName?: string; role?: string },
  ): Promise<UserResponse> {
    return this.userService.updateUser(id, body);
  }

  @Post(":id/reset-password")
  async resetPassword(@Param("id") id: string): Promise<{ message: string }> {
    await this.userService.resetPassword(id);
    return { message: "パスワードをリセットしました" };
  }
}

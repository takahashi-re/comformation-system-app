import { Body, Controller, Get, Param, Post, Put, Query, Delete, Req, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { UserService } from "../service/user.service";
import { LoginService } from "../service/login.service";
import type { UserListResponse, UserResponse } from "../service/user.service";

@Controller("api/users")
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly loginService: LoginService,
  ) {}

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

  @Delete(":id")
  async deleteUser(@Param("id") id: string, @Req() request: Request): Promise<void> {
    const sessionToken = request.cookies?.["session_token"];
    if (!sessionToken) {
      throw new UnauthorizedException("ログインセッションが存在しません");
    }

    const session = this.loginService.getSessionByToken(sessionToken);
    await this.userService.deleteUser(id, session.employee_id);
  }
}

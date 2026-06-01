import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ScoutService } from '../service/scout.service';
import { ScoutEntity } from '../type/scout';
import { LoginService } from '../service/login.service';

@Controller('api/scouts')
export class ScoutController {
  private readonly SESSION_COOKIE_NAME = 'session_token';

  constructor(
    private readonly scoutService: ScoutService,
    private readonly loginService: LoginService,
  ) {}

  @Get()
  findAll() {
    return this.scoutService.findAll();
  }

  @Post()
  create(@Body() body: ScoutEntity) {
    return this.scoutService.create(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scoutService.findOne(id);
  }

  @Get(':id/approval-detail')
  findApprovalDetail(@Param('id') id: string) {
    return this.scoutService.findApprovalDetail(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { body: string, status: string }) {
    return this.scoutService.update(id, body);
  }

  @Post(':id/approve')
approve(
  @Param('id') id: string,
  @Body()
  body: {
    approverEmployeeId: string
    comment: string
    reasonKeys: string[]
  },
) {
    return this.scoutService.approve(id, body)
}

  @Post(':id/reject')
  reject(
    @Param('id') id: string,
    @Body()
    body: {
      returnedByEmployeeId: string
      returnComment: string
      reasonKeys: string[]
      reapplyTarget?: 'APPROVER' | 'ADMIN'
    },
  ) {
    return this.scoutService.reject(id, body)
  }

}

 
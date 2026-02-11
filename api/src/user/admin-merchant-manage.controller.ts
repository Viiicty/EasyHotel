import { Controller, Get, Param, Put, Delete, Query, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('admin/merchant-manage')
export class AdminMerchantManageController {
  constructor(private readonly userService: UserService) {}

  @Get('merchants')
  async getMerchants(@Query('status') status?: string, @Query('keyword') keyword?: string) {
    return this.userService.findAllMerchants();
  }

  @Delete('merchants/:id')
  async deleteMerchant(@Param('id') id: string) {
    return this.userService.deleteMerchant(id);
  }

  @Put('merchants/:id/status')
  async updateMerchantStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.userService.updateMerchantStatus(id, body.status);
  }

  @Put('merchants/:id')
  async updateMerchant(@Param('id') id: string, @Body() body: any) {
    return this.userService.updateMerchant(id, body);
  }
}

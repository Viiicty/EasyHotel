import { Controller, Get, Post, Put, Body, Param, Query, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('availability')
  async getAvailability(
    @Query('roomTypeId') roomTypeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Request() req: any,
  ) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return this.inventoryService.checkAvailability(req.user.id, roomTypeId, fromDate, toDate);
  }

  @Post('holds')
  async createHold(
    @Body() body: {
      roomTypeId: string;
      checkIn: string;
      checkOut: string;
      qty: number;
    },
    @Request() req: any,
  ) {
    const checkInDate = new Date(body.checkIn);
    const checkOutDate = new Date(body.checkOut);
    return this.inventoryService.holdInventory(
      req.user.id,
      body.roomTypeId,
      checkInDate,
      checkOutDate,
      body.qty,
    );
  }

  @Post('holds/:holdToken/confirm')
  async confirmHold(
    @Param('holdToken') holdToken: string,
    @Request() req: any,
  ) {
    return this.inventoryService.confirmHold(holdToken, req.user.id);
  }

  @Post('holds/expire-job')
  async expireHolds(@Body() body: { limit?: number }) {
    const limit = body.limit || 100;
    return this.inventoryService.expireHolds(limit);
  }

  @Post('init')
  async initInventory(
    @Body() body: {
      roomTypeId: string;
      from: string;
      to: string;
      totalQty: number;
    },
    @Request() req: any,
  ) {
    const fromDate = new Date(body.from);
    const toDate = new Date(body.to);
    return this.inventoryService.initInventory(
      req.user.id,
      body.roomTypeId,
      fromDate,
      toDate,
      body.totalQty,
    );
  }
}

@Controller('merchant/inventory')
export class MerchantInventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('daily')
  async getDailyInventory(
    @Query('roomTypeIds') roomTypeIds: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Request() req: any,
  ) {
    const roomTypeIdArray = roomTypeIds.split(',');
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return this.inventoryService.getDailyInventory(req.user.id, roomTypeIdArray, fromDate, toDate);
  }

  @Put(':roomTypeId/daily')
  async updateDailyInventory(
    @Param('roomTypeId') roomTypeId: string,
    @Body() body: { date: string; totalQty: number },
    @Request() req: any,
  ) {
    return this.inventoryService.updateDailyInventory(req.user.id, roomTypeId, new Date(body.date), body.totalQty);
  }
}

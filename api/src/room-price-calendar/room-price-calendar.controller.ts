import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';

import { RoomPriceCalendarService } from './room-price-calendar.service';
import { RoomPriceCalendarEntity } from './room-price-calendar.entity';

@Controller('room-price-calendar')
export class RoomPriceCalendarController {
  constructor(private readonly roomPriceCalendarService: RoomPriceCalendarService) {}

  @Post()
  async create(@Body() calendarData: Partial<RoomPriceCalendarEntity>, @Request() req): Promise<RoomPriceCalendarEntity> {
    return this.roomPriceCalendarService.create({
      ...calendarData,
      createdBy: req.user.id,
    });
  }

  @Get()
  async findAll(): Promise<RoomPriceCalendarEntity[]> {
    return this.roomPriceCalendarService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RoomPriceCalendarEntity> {
    return this.roomPriceCalendarService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() calendarData: Partial<RoomPriceCalendarEntity>, @Request() req): Promise<RoomPriceCalendarEntity> {
    return this.roomPriceCalendarService.update(id, {
      ...calendarData,
      updatedBy: req.user.id,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.roomPriceCalendarService.remove(id);
  }

  @Get('rate-plan/:ratePlanId')
  async findByRatePlanId(@Param('ratePlanId') ratePlanId: string, @Request() req): Promise<RoomPriceCalendarEntity[]> {
    return this.roomPriceCalendarService.findByRatePlanId(req.user.id, ratePlanId);
  }

  @Get('rate-plan/:ratePlanId/range')
  async findByRatePlanIdAndDateRange(
    @Param('ratePlanId') ratePlanId: string,
    @Param('startDate') startDate: string,
    @Param('endDate') endDate: string,
    @Request() req
  ): Promise<RoomPriceCalendarEntity[]> {
    return this.roomPriceCalendarService.findByRatePlanIdAndDateRange(
      req.user.id,
      ratePlanId,
      new Date(startDate),
      new Date(endDate)
    );
  }
}

@Controller('merchant/rate-plans')
export class MerchantRatePlanController {
  constructor(private readonly roomPriceCalendarService: RoomPriceCalendarService) {}

  @Get('daily')
  async getDailyPrices(
    @Query('ratePlanIds') ratePlanIds: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Request() req: any,
  ) {
    const ratePlanIdArray = ratePlanIds.split(',');
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return this.roomPriceCalendarService.getDailyPrices(req.user.id, ratePlanIdArray, fromDate, toDate);
  }

  @Put(':ratePlanId/daily')
  async updateDailyPrice(
    @Param('ratePlanId') ratePlanId: string,
    @Body() body: { date: string; price: number },
    @Request() req: any,
  ) {
    return this.roomPriceCalendarService.updateDailyPrice(req.user.id, ratePlanId, new Date(body.date), body.price);
  }
}

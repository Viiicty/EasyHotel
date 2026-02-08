import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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
  async findByRatePlanId(@Param('ratePlanId') ratePlanId: string): Promise<RoomPriceCalendarEntity[]> {
    return this.roomPriceCalendarService.findByRatePlanId(ratePlanId);
  }

  @Get('rate-plan/:ratePlanId/range')
  async findByRatePlanIdAndDateRange(
    @Param('ratePlanId') ratePlanId: string,
    @Param('startDate') startDate: string,
    @Param('endDate') endDate: string
  ): Promise<RoomPriceCalendarEntity[]> {
    return this.roomPriceCalendarService.findByRatePlanIdAndDateRange(
      ratePlanId,
      new Date(startDate),
      new Date(endDate)
    );
  }
}

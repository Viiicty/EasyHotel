import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';

import { RoomRatePlanService } from './room-rate-plan.service';
import { RoomRatePlanEntity } from './room-rate-plan.entity';

@Controller('room-rate-plan')
export class RoomRatePlanController {
  constructor(private readonly roomRatePlanService: RoomRatePlanService) {}

  @Post()
  async create(@Body() ratePlanData: Partial<RoomRatePlanEntity>, @Request() req): Promise<RoomRatePlanEntity> {
    return this.roomRatePlanService.create({
      ...ratePlanData,
      createdBy: req.user.id,
    });
  }

  @Get()
  async findAll(): Promise<RoomRatePlanEntity[]> {
    return this.roomRatePlanService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RoomRatePlanEntity> {
    return this.roomRatePlanService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() ratePlanData: Partial<RoomRatePlanEntity>, @Request() req): Promise<RoomRatePlanEntity> {
    return this.roomRatePlanService.update(id, {
      ...ratePlanData,
      updatedBy: req.user.id,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.roomRatePlanService.remove(id);
  }

  @Get('room-type/:roomTypeId')
  async findByRoomTypeId(@Param('roomTypeId') roomTypeId: string): Promise<RoomRatePlanEntity[]> {
    return this.roomRatePlanService.findByRoomTypeId(roomTypeId);
  }
}

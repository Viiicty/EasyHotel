import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoomTypeService } from './room-type.service';
import { RoomTypeEntity } from './room-type.entity';

@Controller('room-type')
export class RoomTypeController {
  constructor(private readonly roomTypeService: RoomTypeService) {}

  @Post()
  async create(@Body() roomTypeData: Partial<RoomTypeEntity>, @Request() req): Promise<RoomTypeEntity> {
    return this.roomTypeService.create({
      ...roomTypeData,
      createdBy: req.user.id,
    });
  }

  @Get()
  async findAll(): Promise<RoomTypeEntity[]> {
    return this.roomTypeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RoomTypeEntity> {
    return this.roomTypeService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() roomTypeData: Partial<RoomTypeEntity>, @Request() req): Promise<RoomTypeEntity> {
    return this.roomTypeService.update(id, {
      ...roomTypeData,
      updatedBy: req.user.id,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.roomTypeService.remove(id);
  }

  @Get('hotel/:hotelId')
  async findByHotelId(@Param('hotelId') hotelId: string): Promise<RoomTypeEntity[]> {
    return this.roomTypeService.findByHotelId(hotelId);
  }

  @Post(':id/submit')
  async submitForReview(@Param('id') id: string, @Request() req): Promise<RoomTypeEntity> {
    return this.roomTypeService.submitForReview(id, req.user.id);
  }

  @Put(':id/approve')
  async approve(@Param('id') id: string, @Request() req): Promise<RoomTypeEntity> {
    return this.roomTypeService.approve(id, req.user.id);
  }

  @Put(':id/reject')
  async reject(@Param('id') id: string, @Request() req): Promise<RoomTypeEntity> {
    return this.roomTypeService.reject(id, req.user.id);
  }

  @Put('audit/:id')
    async audit(@Param('id') id: string, @Body() auditData: { status: string; rejectReason?: string }, @Request() req): Promise<RoomTypeEntity> {
      return this.roomTypeService.audit(id, auditData,req.user.id);
    }

}

import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoomTypeService } from './room-type.service';
import { RoomTypeEntity } from './room-type.entity';
import { Public } from '../common/public.decorator';

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

@Controller('merchant/room-types')
export class MerchantRoomTypeController {
  constructor(private readonly roomTypeService: RoomTypeService) {}

  @Get()
  async getRoomTypes(@Query('hotelId') hotelId: string, @Request() req: any) {
    return this.roomTypeService.getRoomTypesByMerchant(req.user.id, hotelId);
  }

  @Put(':roomTypeId/default-price')
  async updateDefaultPrice(@Param('roomTypeId') roomTypeId: string, @Body() body: { defaultPrice: number }, @Request() req: any) {
    return this.roomTypeService.updateDefaultPrice(req.user.id, roomTypeId, body.defaultPrice);
  }

  @Put(':roomTypeId/default-inventory')
  async updateDefaultInventory(@Param('roomTypeId') roomTypeId: string, @Body() body: { defaultInventory: number }, @Request() req: any) {
    return this.roomTypeService.updateDefaultInventory(req.user.id, roomTypeId, body.defaultInventory);
  }
}

/*********************小程序 *********************/

@Controller('mini/room-type')
export class MiniRoomTypeController {
  constructor(private readonly roomTypeService: RoomTypeService) {}

  @Public()
  @Get('hotel/:hotelId')
  async getRoomTypesByHotel(@Param('hotelId') hotelId: string): Promise<any[]> {
    return this.roomTypeService.getMiniRoomTypesByHotel(hotelId);
  }
}

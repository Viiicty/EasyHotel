import { Controller, Get, Post, Put, Delete, Body, Param, NotFoundException, Query, Req } from '@nestjs/common';
import { RoomTypePriceDailyService } from './room-type-price-daily.service';
import { RoomTypePriceDailyEntity } from './room-type-price-daily.entity';

@Controller('room-type-price-daily')
export class RoomTypePriceDailyController {
  constructor(private readonly priceService: RoomTypePriceDailyService) {}

  @Get('hotel/:hotelId')
  async findByHotel(@Param('hotelId') hotelId: string, @Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    if (!startDate || !endDate) {
      throw new NotFoundException('请提供startDate和endDate参数');
    }
    return this.priceService.findByHotelAndDateRange(hotelId, new Date(startDate), new Date(endDate));
  }

  @Get('room-type/:roomTypeId')
  async findByRoomType(@Param('roomTypeId') roomTypeId: string, @Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    if (!startDate || !endDate) {
      throw new NotFoundException('请提供startDate和endDate参数');
    }
    return this.priceService.findByRoomTypeAndDateRange(roomTypeId, new Date(startDate), new Date(endDate));
  }

  @Get(':hotelId/:roomTypeId/:date')
  async findOne(@Param('hotelId') hotelId: string, @Param('roomTypeId') roomTypeId: string, @Param('date') date: string) {
    return this.priceService.findOne(hotelId, roomTypeId, new Date(date));
  }

  @Post()
  async create(@Body() priceData: Partial<RoomTypePriceDailyEntity>, @Req() req: any) {
    return this.priceService.create(priceData, req.user.id);
  }

  @Put('batch/:hotelId/:roomTypeId')
  async batchUpdate(@Param('hotelId') hotelId: string, @Param('roomTypeId') roomTypeId: string, @Query('startDate') startDate: string, @Query('endDate') endDate: string, @Query('price') price: string, @Req() req: any) {
    if (!startDate || !endDate || !price) {
      throw new NotFoundException('请提供startDate、endDate和price参数');
    }
    return this.priceService.batchUpdate(hotelId, roomTypeId, new Date(startDate), new Date(endDate), parseFloat(price), req.user.id);
  }

  @Put(':hotelId/:roomTypeId/:date')
  async update(@Param('hotelId') hotelId: string, @Param('roomTypeId') roomTypeId: string, @Param('date') date: string, @Body() priceData: Partial<RoomTypePriceDailyEntity>, @Req() req: any) {
    return this.priceService.update(hotelId, roomTypeId, new Date(date), priceData, req.user.id);
  }

  @Delete('batch/:hotelId/:roomTypeId')
  async batchDelete(@Param('hotelId') hotelId: string, @Param('roomTypeId') roomTypeId: string, @Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    if (!startDate || !endDate) {
      throw new NotFoundException('请提供startDate和endDate参数');
    }
    await this.priceService.batchDelete(hotelId, roomTypeId, new Date(startDate), new Date(endDate));
    return { message: '批量删除成功' };
  }

  @Delete(':hotelId/:roomTypeId/:date')
  async delete(@Param('hotelId') hotelId: string, @Param('roomTypeId') roomTypeId: string, @Param('date') date: string) {
    await this.priceService.delete(hotelId, roomTypeId, new Date(date));
    return { message: '删除成功' };
  }
}

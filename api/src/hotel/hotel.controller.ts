import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';

import { HotelService } from './hotel.service';
import { HotelEntity } from './hotel.entity';
import { HotelSubmissionService } from '../hotel-submission/hotel-submission.service';


@Controller('hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService,

  ) {}

  @Post()
  async create(@Body() hotelData: Partial<HotelEntity>, @Request() req): Promise<HotelEntity> {
   console.log("req.user");
    console.log(hotelData);
    return this.hotelService.create({
      ...hotelData,
      merchantId: req.user.id,
      createdBy: req.user.id,
    });
  }

  @Get()
  async findAll(@Request() req): Promise<HotelEntity[]> {
    return this.hotelService.findAll();
  }

  @Get('merchant/:merchantId')
  async findByMerchantId(@Param('merchantId') merchantId: string): Promise<HotelEntity[]> {
    return this.hotelService.findByMerchantId(merchantId);
  }

  @Get('city/:cityCode')
  async findByCityCode(@Param('cityCode') cityCode: string): Promise<HotelEntity[]> {
    return this.hotelService.findByCityCode(cityCode);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HotelEntity> {
    return this.hotelService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() hotelData: Partial<HotelEntity>, @Request() req): Promise<HotelEntity> {
    return this.hotelService.update(id, {
      ...hotelData,
      updatedBy: req.user.id,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.hotelService.remove(id);
  }

  @Put('audit/:id')
  async audit(@Param('id') id: string, @Body() auditData: { status: string; rejectReason?: string }, @Request() req): Promise<HotelEntity> {
    return this.hotelService.audit(id, auditData,req.user.id);
  }
}

@Controller('merchant/hotels')
export class MerchantHotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Get()
  async getHotels(@Request() req: any) {
    return this.hotelService.getApprovedHotelsByMerchant(req.user.id);
  }
}

@Controller('admin/online-manage')
export class AdminOnlineManageController {
  constructor(private readonly hotelService: HotelService) {}

  @Get('hotels')
  async getHotels(@Query('status') status?: string, @Query('city') city?: string, @Query('keyword') keyword?: string) {
    return this.hotelService.getOnlineManageList({ status, city, keyword });
  }

  @Get('hotels/:id')
  async getHotelDetail(@Param('id') id: string) {
    return this.hotelService.getHotelWithRoomTypes(id);
  }

  @Put('hotels/:id/online')
  async setOnline(@Param('id') id: string) {
    return this.hotelService.updateAvailableStatus(id, 'UP');
  }

  @Put('hotels/:id/offline')
  async setOffline(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.hotelService.updateAvailableStatus(id, 'DOWN');
  }
}

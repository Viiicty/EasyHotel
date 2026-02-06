import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HotelService } from './hotel.service';
import { HotelEntity } from './hotel.entity';

@Controller('hotel')
@UseGuards(AuthGuard())
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

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
    return this.hotelService.findByMerchantId(req.user.id);
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
    console.log("req.id");
    console.log(id);
    
    console.log(hotelData);
    return this.hotelService.update(id, {
      ...hotelData,
      updatedBy: req.user.id,
    });
  }

  @Delete(':id')
  
  async remove(@Param('id') id: string): Promise<void> {
    return this.hotelService.remove(id);
  }

  @Put(':id/audit')
  async audit(@Param('id') id: string, @Body() auditData: { status: string; reviewedBy: string; rejectReason?: string }): Promise<HotelEntity> {
    return this.hotelService.update(id, auditData);
  }
}

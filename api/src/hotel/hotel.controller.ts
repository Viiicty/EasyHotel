import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';

import { HotelService } from './hotel.service';
import { HotelEntity } from './hotel.entity';
import { HotelSubmissionService } from '../hotel-submission/hotel-submission.service';
import { Public } from '../common/public.decorator';


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

  @Get('merchant')
  async findByMerchant(@Request() req): Promise<HotelEntity[]> {
    return this.hotelService.findByMerchant(req.user.id);
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
  async getHotels(@Query('available') available?: string, @Query('city') city?: string, @Query('keyword') keyword?: string) {
    return this.hotelService.getOnlineManageList({ available, city, keyword });
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

/*********************小程序 *********************/

@Controller('mini/hotel')
export class MiniHotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Public()
  @Get('city/:cityCode')
  async findByCityCode(@Param('cityCode') cityCode: string): Promise<HotelEntity[]> {
    return this.hotelService.findByCityCode(cityCode);
  }

  @Public()
  @Get('list')               //通过hotel表格cityCode查询所有UP的酒店列表
  async getHotelsByCityCode(
    @Query('cityCode') cityCode: string,
    @Query('date') date?: string
  ): Promise<any[]> {
    return this.hotelService.getMiniHotelsByCityCode(cityCode, date);
  }

  @Public()
  @Get('search')
  async searchHotels(
    @Query('cityCode') cityCode?: string,
    @Query('nameZh') nameZh?: string,
    @Query('nameEn') nameEn?: string,
    @Query('starLevel') starLevel?: string,
    @Query('tags') tags?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('checkIn') checkIn?: string,
    @Query('checkOut') checkOut?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string
  ): Promise<any[]> {
    return this.hotelService.searchMiniHotels({
      cityCode,
      nameZh,
      nameEn,
      starLevel: starLevel ? parseInt(starLevel) : undefined,
      tags: tags ? JSON.parse(tags) : undefined,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 10,
      checkIn,
      checkOut,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
    });
  }

  @Public()
  @Get('by-star-level')           //通过星级查询所有小于等于查询条件的酒店列表
  async getHotelsByStarLevel(
    @Query('starLevel') starLevel: string
  ): Promise<any[]> {
    return this.hotelService.searchMiniHotels({
      starLevel: parseInt(starLevel)
    });
  }

  @Public()
  @Get('recommend')           //随机推荐酒店
  async getRecommendHotels(
    @Query('limit') limit?: string,
    @Query('date') date?: string
  ): Promise<any[]> {
    return this.hotelService.getRandomRecommendHotels(limit ? parseInt(limit) : 4, date);
  }

  @Public()
  @Get('tags')           //获取所有可用的标签
  async getAllTags(): Promise<string[]> {
    return this.hotelService.getAllTags();
  }

  @Public()
  @Get('location')
  async getLocation(
    @Query('location') location: string,
    @Query('key') key: string
  ): Promise<any> {
    try {
      const url = `https://restapi.amap.com/v3/geocode/regeo?output=json&location=${location}&key=${key}&radius=1000&extensions=base`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('逆地理编码错误:', error)
      throw new Error('逆地理编码失败')
    }
  }

  @Public()
  @Get(':id')
  async getHotelDetail(@Param('id') id: string): Promise<any> {
    return this.hotelService.getMiniHotelDetail(id);
  }
}

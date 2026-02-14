import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { HomeBannerService } from './home-banner.service';
import { HomeBannerEntity } from './home-banner.entity';
import { Public } from '../common/public.decorator';

@Controller('home-banner')
export class HomeBannerController {
  constructor(private readonly homeBannerService: HomeBannerService) {}

  @Post()
  async create(@Body() bannerData: Partial<HomeBannerEntity>, @Request() req): Promise<HomeBannerEntity> {
    return this.homeBannerService.create({
      ...bannerData,
      createdBy: req.user.id,
    });
  }

  @Public()
  @Get()
  async findAll(): Promise<HomeBannerEntity[]> {
    return this.homeBannerService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HomeBannerEntity> {
    return this.homeBannerService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() bannerData: Partial<HomeBannerEntity>, @Request() req): Promise<HomeBannerEntity> {
    return this.homeBannerService.update(id, {
      ...bannerData,
      updatedBy: req.user.id,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.homeBannerService.remove(id);
  }

  /*********************小程序 *********************/

  @Public()
  @Get('mini/active')
  async findActiveBanners(): Promise<HomeBannerEntity[]> {
    return this.homeBannerService.findActiveBanners();
  }

  @Public()
  @Get('mini/city/:cityCode')
  async findByCityCode(@Param('cityCode') cityCode: string): Promise<HomeBannerEntity[]> {
    return this.homeBannerService.findByCityCode(cityCode);
  }

  @Public()
  @Get('mini/hotel/:hotelId')
  async findByHotelId(@Param('hotelId') hotelId: string): Promise<HomeBannerEntity[]> {
    return this.homeBannerService.findByHotelId(hotelId);
  }
}

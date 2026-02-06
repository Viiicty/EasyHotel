import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HomeBannerService } from './home-banner.service';
import { HomeBannerEntity } from './home-banner.entity';

@Controller('home-banner')
export class HomeBannerController {
  constructor(private readonly homeBannerService: HomeBannerService) {}

  @Post()
  @UseGuards(AuthGuard())
  async create(@Body() bannerData: Partial<HomeBannerEntity>, @Request() req): Promise<HomeBannerEntity> {
    return this.homeBannerService.create({
      ...bannerData,
      createdBy: req.user.id,
    });
  }

  @Get()
  async findAll(): Promise<HomeBannerEntity[]> {
    return this.homeBannerService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HomeBannerEntity> {
    return this.homeBannerService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  async update(@Param('id') id: string, @Body() bannerData: Partial<HomeBannerEntity>, @Request() req): Promise<HomeBannerEntity> {
    return this.homeBannerService.update(id, {
      ...bannerData,
      updatedBy: req.user.id,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async remove(@Param('id') id: string): Promise<void> {
    return this.homeBannerService.remove(id);
  }

  @Get('city/:cityCode')
  async findByCityCode(@Param('cityCode') cityCode: string): Promise<HomeBannerEntity[]> {
    return this.homeBannerService.findByCityCode(cityCode);
  }

  @Get('active')
  async findActiveBanners(@Param('cityCode') cityCode?: string): Promise<HomeBannerEntity[]> {
    return this.homeBannerService.findActiveBanners(cityCode);
  }

  @Get('hotel/:hotelId')
  async findByHotelId(@Param('hotelId') hotelId: string): Promise<HomeBannerEntity[]> {
    return this.homeBannerService.findByHotelId(hotelId);
  }
}

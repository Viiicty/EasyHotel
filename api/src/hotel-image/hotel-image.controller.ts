import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HotelImageService } from './hotel-image.service';
import { HotelImageEntity } from './hotel-image.entity';

@Controller('hotel-image')
export class HotelImageController {
  constructor(private readonly hotelImageService: HotelImageService) {}

  @Post()
  @UseGuards(AuthGuard())
  async create(@Body() imageData: Partial<HotelImageEntity>, @Request() req): Promise<HotelImageEntity> {
    return this.hotelImageService.create({
      ...imageData,
      createdBy: req.user.id,
    });
  }

  @Get()
  async findAll(): Promise<HotelImageEntity[]> {
    return this.hotelImageService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HotelImageEntity> {
    return this.hotelImageService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  async update(@Param('id') id: string, @Body() imageData: Partial<HotelImageEntity>, @Request() req): Promise<HotelImageEntity> {
    return this.hotelImageService.update(id, {
      ...imageData,
      updatedBy: req.user.id,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async remove(@Param('id') id: string): Promise<void> {
    return this.hotelImageService.remove(id);
  }

  @Get('hotel/:hotelId')
  async findByHotelId(@Param('hotelId') hotelId: string): Promise<HotelImageEntity[]> {
    return this.hotelImageService.findByHotelId(hotelId);
  }

  @Get('hotel/:hotelId/cover')
  async findCoverByHotelId(@Param('hotelId') hotelId: string): Promise<HotelImageEntity> {
    return this.hotelImageService.findCoverByHotelId(hotelId);
  }
}

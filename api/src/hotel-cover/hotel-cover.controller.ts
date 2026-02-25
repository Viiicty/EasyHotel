import { Controller, Get, Post, Body, Param, Delete, Put, Request } from '@nestjs/common';
import { HotelCoverService } from './hotel-cover.service';
import { HotelCoverEntity } from './hotel-cover.entity';
import { Public } from '../common/public.decorator';

@Controller('hotel-cover')
export class HotelCoverController {
  constructor(private readonly hotelCoverService: HotelCoverService) {}

  @Public()
  @Get()
  async findAll(): Promise<HotelCoverEntity[]> {
    return this.hotelCoverService.findAll();
  }

  @Public()
  @Get('hotel/:hotelId')
  async findByHotelId(@Param('hotelId') hotelId: string): Promise<HotelCoverEntity[]> {
    return this.hotelCoverService.findByHotelId(hotelId);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HotelCoverEntity | undefined> {
    return this.hotelCoverService.findOne(id);
  }

  @Post()
  async create(@Body() coverData: Partial<HotelCoverEntity>, @Request() req: any): Promise<HotelCoverEntity> {
    return this.hotelCoverService.create({
      ...coverData,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() coverData: Partial<HotelCoverEntity>, @Request() req: any): Promise<HotelCoverEntity | undefined> {
    return this.hotelCoverService.update(id, {
      ...coverData,
      updatedBy: req.user.id
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.hotelCoverService.remove(id);
  }

  @Delete('hotel/:hotelId')
  async removeByHotelId(@Param('hotelId') hotelId: string): Promise<void> {
    return this.hotelCoverService.removeByHotelId(hotelId);
  }
}

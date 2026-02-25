import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { HotelImageService } from './hotel-image.service';
import { HotelImageEntity } from './hotel-image.entity';
import { Public } from '../common/public.decorator';

@Controller('hotel-image')
export class HotelImageController {
  constructor(private readonly hotelImageService: HotelImageService) {}

  @Public()
  @Get('hotel/:hotelId')
  async findByHotelId(@Param('hotelId') hotelId: string): Promise<HotelImageEntity[]> {
    console.log('=== HotelImageController.findByHotelId START ===')
    console.log('Request received at:', new Date().toISOString())
    console.log('Hotel ID:', hotelId)
    console.log('Hotel ID type:', typeof hotelId)
    
    try {
      const result = await this.hotelImageService.findByHotelId(hotelId);
      console.log('Found images:', result)
      console.log('Images count:', result?.length || 0)
      console.log('=== HotelImageController.findByHotelId END ===')
      return result;
    } catch (error) {
      console.error('Error in findByHotelId:', error)
      throw error;
    }
  }

  @Delete('hotel/:hotelId')
  async deleteByHotelId(@Param('hotelId') hotelId: string): Promise<void> {
    console.log('=== HotelImageController.deleteByHotelId ===')
    console.log('Hotel ID:', hotelId)
    await this.hotelImageService.deleteByHotelId(hotelId);
    console.log('Deleted images for hotel:', hotelId)
  }

  @Post()
  async create(@Body() imageData: Partial<HotelImageEntity>, @Request() req): Promise<HotelImageEntity> {
    return this.hotelImageService.create({
      ...imageData,
      createdBy: req.user?.id,
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

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.hotelImageService.remove(id);
  }

  @Post('batch')
  async batchCreate(@Body() images: Partial<HotelImageEntity>[], @Request() req): Promise<HotelImageEntity[]> {
    return this.hotelImageService.batchCreate(
      images.map(image => ({
        ...image,
        createdBy: req.user?.id,
      }))
    );
  }

  @Put('sort-order')
  async updateSortOrder(@Body() images: Array<{ id: string; sortNo: number }>): Promise<void> {
    console.log('=== HotelImageController.updateSortOrder ===')
    console.log('Images:', images)
    return this.hotelImageService.updateSortOrder(images);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() imageData: Partial<HotelImageEntity>, @Request() req): Promise<HotelImageEntity> {
    return this.hotelImageService.update(id, {
      ...imageData,
      updatedBy: req.user?.id,
    });
  }
}

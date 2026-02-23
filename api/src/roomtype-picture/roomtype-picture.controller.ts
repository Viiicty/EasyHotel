import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { RoomtypePictureService } from './roomtype-picture.service';
import { RoomtypePictureEntity } from './roomtype-picture.entity';
import { Public } from '../common/public.decorator';

@Controller('roomtype-picture')
export class RoomtypePictureController {
  constructor(private readonly roomtypePictureService: RoomtypePictureService) {}

  @Public()
  @Get('room-type/:roomTypeId')
  async findByRoomTypeId(@Param('roomTypeId') roomTypeId: string): Promise<RoomtypePictureEntity[]> {
    return this.roomtypePictureService.findByRoomTypeId(roomTypeId);
  }

  @Public()
  @Get('hotel/:hotelId')
  async findByHotelId(@Param('hotelId') hotelId: string): Promise<RoomtypePictureEntity[]> {
    return this.roomtypePictureService.findByHotelId(hotelId);
  }

  @Post()
  async create(@Body() pictureData: Partial<RoomtypePictureEntity>, @Request() req): Promise<RoomtypePictureEntity> {
    return this.roomtypePictureService.create({
      ...pictureData,
      createdBy: req.user?.id,
    });
  }

  @Get()
  async findAll(): Promise<RoomtypePictureEntity[]> {
    return this.roomtypePictureService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RoomtypePictureEntity> {
    return this.roomtypePictureService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() pictureData: Partial<RoomtypePictureEntity>, @Request() req): Promise<RoomtypePictureEntity> {
    return this.roomtypePictureService.update(id, {
      ...pictureData,
      updatedBy: req.user?.id,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.roomtypePictureService.remove(id);
  }

  @Delete('room-type/:roomTypeId')
  async deleteByRoomTypeId(@Param('roomTypeId') roomTypeId: string): Promise<void> {
    return this.roomtypePictureService.deleteByRoomTypeId(roomTypeId);
  }

  @Post('batch')
  async batchCreate(@Body() pictures: Partial<RoomtypePictureEntity>[], @Request() req): Promise<RoomtypePictureEntity[]> {
    console.log('=== RoomtypePictureController.batchCreate START ===');
    console.log('Received pictures:', pictures);
    console.log('User ID:', req.user?.id);
    
    try {
      const result = await this.roomtypePictureService.batchCreate(
        pictures.map(picture => ({
          ...picture,
          createdBy: req.user?.id,
        }))
      );
      
      console.log('Batch create result:', result);
      console.log('=== RoomtypePictureController.batchCreate END ===');
      return result;
    } catch (error) {
      console.error('Error in batchCreate:', error);
      throw error;
    }
  }

  @Put('sort-order')
  async updateSortOrder(@Body() pictures: Array<{ id: string; sortNo: number }>): Promise<void> {
    return this.roomtypePictureService.updateSortOrder(pictures);
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HotelSubmissionService } from './hotel-submission.service';
import { HotelSubmissionEntity } from './hotel-submission.entity';

@Controller('hotel-submission')
export class HotelSubmissionController {
  constructor(private readonly hotelSubmissionService: HotelSubmissionService) {}

  @Post()
  async create(@Body() submissionData: Partial<HotelSubmissionEntity>, @Request() req): Promise<HotelSubmissionEntity> {
    return this.hotelSubmissionService.create({
      ...submissionData,
      merchantId: req.user.id,
      createdBy: req.user.id,
    });
  }

  @Get()
  async findAll(): Promise<HotelSubmissionEntity[]> {
    return this.hotelSubmissionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HotelSubmissionEntity> {
    return this.hotelSubmissionService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() submissionData: Partial<HotelSubmissionEntity>, @Request() req): Promise<HotelSubmissionEntity> {
    return this.hotelSubmissionService.update(id, {
      ...submissionData,
      updatedBy: req.user.id,
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.hotelSubmissionService.remove(id);
  }

  @Get('hotel/:hotelId')
  async findByHotelId(@Param('hotelId') hotelId: string): Promise<HotelSubmissionEntity> {
    return this.hotelSubmissionService.findByHotelId(hotelId);
  }

  @Get('roomtype/:roomtypeId')
  async findByRoomTypeId(@Param('roomtypeId') roomtypeId: string): Promise<HotelSubmissionEntity> {
    return this.hotelSubmissionService.findByRoomTypeId(roomtypeId);
  }

  @Get('merchant/:merchantId')
  async findByMerchantId(@Param('merchantId') merchantId: string): Promise<HotelSubmissionEntity[]> {
    return this.hotelSubmissionService.findByMerchantId(merchantId);
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: string): Promise<HotelSubmissionEntity[]> {
    return this.hotelSubmissionService.findByStatus(status);
  }

  @Put(':id/approve')
  async approve(@Param('id') id: string, @Request() req): Promise<HotelSubmissionEntity> {
    return this.hotelSubmissionService.approve(id, req.user.id);
  }

  @Put(':id/reject')
  async reject(@Param('id') id: string, @Body('rejectReason') rejectReason: string, @Request() req): Promise<HotelSubmissionEntity> {
    return this.hotelSubmissionService.reject(id, rejectReason, req.user.id);
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
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

  @Get('hotel/:hotelId')
  async findByHotelId(@Param('hotelId') hotelId: string): Promise<HotelSubmissionEntity> {
    return this.hotelSubmissionService.findByHotelId(hotelId);
  }

  @Get('roomtype/:roomtypeId')
  async findByRoomTypeId(@Param('roomtypeId') roomtypeId: string): Promise<HotelSubmissionEntity> {
    return this.hotelSubmissionService.findByRoomTypeId(roomtypeId);
  }

  @Get('merchant/:merchantId/rejected')
  async findRejectedByMerchantId(@Param('merchantId') merchantId: string): Promise<HotelSubmissionEntity[]> {
    console.log('=== findRejectedByMerchantId called with merchantId:', merchantId);
    const result = await this.hotelSubmissionService.findRejectedByMerchantId(merchantId);
    console.log('=== findRejectedByMerchantId result:', result);
    return result;
  }

  @Get('merchant/:merchantId')
  async findByMerchantId(@Param('merchantId') merchantId: string): Promise<HotelSubmissionEntity[]> {
    return this.hotelSubmissionService.findByMerchantId(merchantId);
  }

  @Get('stats/pending')
  async countPending(): Promise<any> {
    const result = await this.hotelSubmissionService.countPending();
    return result;
  }

  @Get('stats/today-approved')
  async countTodayApproved(): Promise<any> {
    const result = await this.hotelSubmissionService.countTodayApproved();
    return result;
  }

  @Get('stats/today-rejected')
  async countTodayRejected(): Promise<any> {
    const result = await this.hotelSubmissionService.countTodayRejected();
    return result;
  }

  @Get('stats/today-audited')
  async countTodayAudited(): Promise<any> {
    const result = await this.hotelSubmissionService.countTodayAudited();
    return result;
  }

  @Get('pending-all')
  async findAllPending(): Promise<any> {
    const result = await this.hotelSubmissionService.findAllPending();
    return result;
  }

  @Get('recent-audits')
  async findRecentAudits(@Query('limit') limit?: string): Promise<any> {
    const result = await this.hotelSubmissionService.findRecentAudits(limit ? parseInt(limit) : 3);
    return result;
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: string): Promise<any> {
    const result = await this.hotelSubmissionService.findByStatus(status);
    return result;
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

  @Put(':id/approve')
  async approve(@Param('id') id: string, @Request() req): Promise<HotelSubmissionEntity> {
    return this.hotelSubmissionService.approve(id, req.user.id);
  }

  @Put(':id/reject')
  async reject(@Param('id') id: string, @Body('rejectReason') rejectReason: string, @Request() req): Promise<HotelSubmissionEntity> {
    return this.hotelSubmissionService.reject(id, rejectReason, req.user.id);
  }
}

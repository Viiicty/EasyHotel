import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';

import { BookingOrderService } from './booking-order.service';
import { BookingOrderEntity } from './booking-order.entity';

@Controller('booking-order')
export class BookingOrderController {
  constructor(private readonly bookingOrderService: BookingOrderService) {}

  @Post()

  async create(@Body() orderData: Partial<BookingOrderEntity>, @Request() req): Promise<BookingOrderEntity> {
    return this.bookingOrderService.create({
      ...orderData,
      createdBy: req.user.id,
    });
  }

  @Get()
  async findAll(): Promise<BookingOrderEntity[]> {
    return this.bookingOrderService.findAll();
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<BookingOrderEntity[]> {
    return this.bookingOrderService.findByUserId(userId);
  }

  @Get('order-no/:orderNo')
  async findByOrderNo(@Param('orderNo') orderNo: string): Promise<BookingOrderEntity> {
    return this.bookingOrderService.findByOrderNo(orderNo);
  }

  @Get('hotel/:hotelId')
  async findByHotelId(@Param('hotelId') hotelId: string): Promise<BookingOrderEntity[]> {
    return this.bookingOrderService.findByHotelId(hotelId);
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: string): Promise<BookingOrderEntity[]> {
    return this.bookingOrderService.findByStatus(status);
  }

  @Get('merchant/:merchantId/today-count')
  async countTodayByMerchantId(@Param('merchantId') merchantId: string): Promise<{ count: number }> {
    return this.bookingOrderService.countTodayByMerchantId(merchantId);
  }

  @Get('merchant/:merchantId/total-nights')
  async sumNightsByMerchantId(@Param('merchantId') merchantId: string): Promise<{ totalNights: number }> {
    return this.bookingOrderService.sumNightsByMerchantId(merchantId);
  }

  @Get('merchant/:merchantId/today-gmv')
  async sumTodayGMVByMerchantId(@Param('merchantId') merchantId: string): Promise<{ totalGMV: number }> {
    return this.bookingOrderService.sumTodayGMVByMerchantId(merchantId);
  }

  @Get('merchant/:merchantId/last7days-count')
  async countLast7DaysByMerchantId(@Param('merchantId') merchantId: string): Promise<{ count: number }> {
    return this.bookingOrderService.countLast7DaysByMerchantId(merchantId);
  }

  @Get('merchant/:merchantId/last7days-nights')
  async sumLast7DaysNightsByMerchantId(@Param('merchantId') merchantId: string): Promise<{ totalNights: number }> {
    return this.bookingOrderService.sumLast7DaysNightsByMerchantId(merchantId);
  }

  @Get('merchant/:merchantId/pending-orders')
  async getPendingOrdersByMerchantId(@Param('merchantId') merchantId: string): Promise<BookingOrderEntity[]> {
    return this.bookingOrderService.getPendingOrdersByMerchantId(merchantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BookingOrderEntity> {
    return this.bookingOrderService.findOne(id);
  }

  @Put(':id')

  async update(@Param('id') id: string, @Body() orderData: Partial<BookingOrderEntity>, @Request() req): Promise<BookingOrderEntity> {
    return this.bookingOrderService.update(id, {
      ...orderData,
      updatedBy: req.user.id,
    });
  }

  @Delete(':id')

  async remove(@Param('id') id: string): Promise<void> {
    return this.bookingOrderService.remove(id);
  }
}

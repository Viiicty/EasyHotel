import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BookingOrderService } from './booking-order.service';
import { BookingOrderEntity } from './booking-order.entity';

@Controller('booking-order')
export class BookingOrderController {
  constructor(private readonly bookingOrderService: BookingOrderService) {}

  @Post()
  @UseGuards(AuthGuard())
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

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BookingOrderEntity> {
    return this.bookingOrderService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  async update(@Param('id') id: string, @Body() orderData: Partial<BookingOrderEntity>, @Request() req): Promise<BookingOrderEntity> {
    return this.bookingOrderService.update(id, {
      ...orderData,
      updatedBy: req.user.id,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async remove(@Param('id') id: string): Promise<void> {
    return this.bookingOrderService.remove(id);
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
}

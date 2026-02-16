import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Public } from '../common/public.decorator';
import { BookingService } from './booking.service';

interface PrepareBookingDto {
  hotelId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
}

interface SubmitBookingDto {
  hotelId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  nights: number;
  adults: number;
  children: number;
  guestName: string;
  guestPhone: string;
  idCard: string;
  remarks?: string;
}

interface ConfirmBookingDto {
  orderId: string;
  holdToken: string;
}

interface CancelBookingDto {
  orderId: string;
  holdToken: string;
}

interface PrepareBookingResponse {
  hotel: any;
  roomType: any;
  prices: Array<{ date: string; price: number }>;
  totalPrice: number;
  nights: number;
  calculatedRooms: number;
}

interface SubmitBookingResponse {
  orderId: string;
  orderNo: string;
  holdToken: string;
  expireAt: string;
}

interface CheckInventoryDto {
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
}

interface CheckInventoryResponse {
  available: boolean;
  message?: string;
  minRemainingQty?: number;
}

@Controller('booking')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('check-inventory')
  async checkInventory(
    @Body() dto: CheckInventoryDto,
  ): Promise<CheckInventoryResponse> {
    return this.bookingService.checkInventory(dto);
  }

  @Post('prepare')
  async prepareBooking(
    @Body() dto: PrepareBookingDto,
    @Request() req,
  ): Promise<PrepareBookingResponse> {
    return this.bookingService.prepareBooking(req.user.id, dto);
  }

  @Post('submit')
  async submitBooking(
    @Body() dto: SubmitBookingDto,
    @Request() req,
  ): Promise<SubmitBookingResponse> {
    return this.bookingService.submitBooking(req.user.id, dto);
  }

  @Post('confirm')
  async confirmBooking(
    @Body() dto: ConfirmBookingDto,
    @Request() req,
  ): Promise<{ success: boolean }> {
    return this.bookingService.confirmBooking(req.user.id, dto.orderId, dto.holdToken);
  }

  @Post('cancel')
  async cancelBooking(
    @Body() dto: CancelBookingDto,
    @Request() req,
  ): Promise<{ success: boolean }> {
    return this.bookingService.cancelBooking(req.user.id, dto.orderId, dto.holdToken);
  }
}

/*********************小程序 *********************/

@Controller('mini/booking')
@UseGuards(JwtAuthGuard)
export class MiniBookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('check-inventory')
  async checkInventory(
    @Body() dto: CheckInventoryDto,
  ): Promise<CheckInventoryResponse> {
    return this.bookingService.checkInventory(dto);
  }

  @Post('prepare')
  async prepareBooking(
    @Body() dto: PrepareBookingDto,
    @Request() req,
  ): Promise<PrepareBookingResponse> {
    return this.bookingService.prepareBooking(req.user.id, dto);
  }

  @Post('submit')
  async submitBooking(
    @Body() dto: SubmitBookingDto,
    @Request() req,
  ): Promise<SubmitBookingResponse> {
    return this.bookingService.submitBooking(req.user.id, dto);
  }

  @Post('mock-payment')
  async mockPayment(
    @Body() dto: { orderId: string },
    @Request() req,
  ): Promise<{ success: boolean; orderNo: string }> {
    return this.bookingService.mockPayment(req.user.id, dto.orderId);
  }

  @Post('confirm')
  async confirmBooking(
    @Body() dto: ConfirmBookingDto,
    @Request() req,
  ): Promise<{ success: boolean }> {
    return this.bookingService.confirmBooking(req.user.id, dto.orderId, dto.holdToken);
  }

  @Post('cancel')
  async cancelBooking(
    @Body() dto: CancelBookingDto,
    @Request() req,
  ): Promise<{ success: boolean }> {
    return this.bookingService.cancelBooking(req.user.id, dto.orderId, dto.holdToken);
  }
}

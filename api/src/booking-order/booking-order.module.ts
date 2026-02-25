import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingOrderEntity } from './booking-order.entity';
import { BookingOrderController } from './booking-order.controller';
import { BookingOrderService } from './booking-order.service';
import { HotelModule } from '../hotel/hotel.module';

@Module({
  imports: [TypeOrmModule.forFeature([BookingOrderEntity]), HotelModule],
  controllers: [BookingOrderController],
  providers: [BookingOrderService],
  exports: [BookingOrderService],
})
export class BookingOrderModule {}
